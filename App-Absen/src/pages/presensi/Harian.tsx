import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Save, AlertTriangle, Search, X } from 'lucide-react';
import { useAbsensiStore } from '../../store/absensiStore';
import { useSKPLStore } from '../../store/skplStore';
import { absensiService } from '../../services/api';
import type { StatusAbsensi, Absensi } from '../../types';

const STATUS_OPTIONS: StatusAbsensi[] = ['DS', 'NS', 'OFF', 'S', 'I', 'A'];

const STATUS_COLORS: Record<StatusAbsensi, string> = {
    DS: '#10b981', NS: '#f59e0b', OFF: '#6b7280', S: '#3b82f6', I: '#8b5cf6', A: '#ef4444',
};

export default function PresensiHarian() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const tanggal = format(currentDate, 'yyyy-MM-dd');
    const tanggalLabel = format(currentDate, "EEEE, dd MMMM yyyy", { locale: id });

    const { setAbsensi } = useAbsensiStore();
    const { getSKPLByTanggal } = useSKPLStore();

    // Fetch absensi untuk hari ini dari database (auto-generated based on periode shift)
    const [absensiHariIni, setAbsensiHariIni] = useState<Absensi[]>([]);
    const [loadingAbsensi, setLoadingAbsensi] = useState(false);
    const [errorAbsensi, setErrorAbsensi] = useState<string | null>(null);

    const [keterangan, setKeterangan] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);
    const [showNotification, setShowNotification] = useState(true);
    const [originalStatus, setOriginalStatus] = useState<Record<string, StatusAbsensi>>({});
    const [modifiedKaryawan, setModifiedKaryawan] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');



    // Function untuk fetch data
    const fetchAbsensiForDate = async (dateStr: string, isInitialFetch: boolean = true, hideNotificationAfter: boolean = false) => {
        setLoadingAbsensi(true);
        setErrorAbsensi(null);
        try {
            const data = await absensiService.generateAndFetchForDate(dateStr);
            setAbsensiHariIni(data || []);
            // Hanya update originalStatus saat initial fetch (saat tanggal berubah)
            // Jangan update saat refetch setelah save
            if (isInitialFetch) {
                const originalMap: Record<string, StatusAbsensi> = {};
                (data || []).forEach((a) => {
                    originalMap[a.id_karyawan] = a.status as StatusAbsensi;
                });
                setOriginalStatus(originalMap);
                setModifiedKaryawan(new Set()); // Reset modified status saat tanggal berubah
            }
            // Jika hideNotificationAfter true, hide notifikasi
            if (hideNotificationAfter) {
                setShowNotification(false);
            }
        } catch (error) {
            setErrorAbsensi((error as Error).message);
            setAbsensiHariIni([]);
            if (isInitialFetch) {
                setOriginalStatus({});
            }
        } finally {
            setLoadingAbsensi(false);
        }
    };

    // Update notification state dan fetch saat tanggal berubah
    useEffect(() => {
        // Check localStorage untuk melihat apakah user sudah save untuk tanggal ini
        const savedKey = `presisi_saved_${tanggal}`;
        const hasSaved = localStorage.getItem(savedKey);
        setShowNotification(!hasSaved);
        
        // Fetch data
        fetchAbsensiForDate(tanggal);
    }, [tanggal]);

    const skplHariIni = getSKPLByTanggal(tanggal);

    // Filter berdasarkan search query
    const filteredAbsensi = absensiHariIni.filter((a) =>
        (a.karyawan?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.karyawan?.nik.includes(searchQuery))
    );

    const handleSetStatus = (idKaryawan: string, newStatus: StatusAbsensi) => {
        // Ambil status lama untuk di-revert jika ada error
        const oldRecord = absensiHariIni.find(a => a.id_karyawan === idKaryawan);
        const oldStatus = oldRecord?.status;

        // Track that this karyawan's status has been modified by user
        setModifiedKaryawan((prev) => new Set([...prev, idKaryawan]));

        // Optimistic update - update lokal langsung
        setAbsensiHariIni((prev) =>
            prev.map((a) =>
                a.id_karyawan === idKaryawan
                    ? { ...a, status: newStatus }
                    : a
            )
        );
        setShowNotification(true);
        setSaved(false);
        // Hapus dari localStorage ketika user ubah status lagi
        localStorage.removeItem(`presisi_saved_${tanggal}`);

        // Kemudian save ke database
        setAbsensi(idKaryawan, tanggal, newStatus, keterangan[idKaryawan])
            .catch((err) => {
                setErrorAbsensi('Gagal mengubah status: ' + (err as Error).message);
                // Revert jika ada error
                if (oldStatus) {
                    setAbsensiHariIni((prev) =>
                        prev.map((a) =>
                            a.id_karyawan === idKaryawan
                                ? { ...a, status: oldStatus }
                                : a
                        )
                    );
                }
            });
    };

    const handleSaveAll = () => {
        setSaved(true);
        setShowNotification(false);
        // Simpan ke localStorage bahwa user sudah save untuk tanggal ini
        localStorage.setItem(`presisi_saved_${tanggal}`, 'true');
        setTimeout(() => {
            setSaved(false);
            // Update originalStatus dengan status terkini setelah save
            const newOriginalStatus: Record<string, StatusAbsensi> = {};
            absensiHariIni.forEach((a) => {
                newOriginalStatus[a.id_karyawan] = a.status as StatusAbsensi;
            });
            setOriginalStatus(newOriginalStatus);
            setModifiedKaryawan(new Set()); // Reset modified status setelah save berhasil
        }, 3000);
    };

    const diubah = absensiHariIni.filter((a) => {
        // Diubah = karyawan yang statusnya sudah dimodifikasi oleh user
        return modifiedKaryawan.has(a.id_karyawan);
    });
    const conflicts = absensiHariIni.filter((a) => {
        const currentStatus = a.status as StatusAbsensi;
        const origStatus = originalStatus[a.id_karyawan];
        // Konflik = sudah diubah ke OFF tapi punya SKPL
        const hasSkpl = skplHariIni.some((s) => s.karyawanList?.some((k) => k.id === a.id_karyawan));
        return currentStatus === 'OFF' && currentStatus !== origStatus && hasSkpl;
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Presensi Harian</h1>
                    <p className="page-subtitle">Input status kehadiran semua karyawan</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn-secondary" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', minWidth: 200, textAlign: 'center' }}>
                        {tanggalLabel}
                    </span>
                    <button className="btn btn-secondary" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight size={16} />
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>
                        Hari Ini
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {errorAbsensi && (
                <div className="alert alert-warning mb-4">
                    <AlertTriangle size={16} />
                    <span>⚠️ {errorAbsensi}</span>
                </div>
            )}
            {conflicts.length > 0 && (
                <div className="alert alert-warning mb-4">
                    <AlertTriangle size={16} />
                    <span>
                        <strong>Konflik terdeteksi!</strong> {conflicts.map((a) => a.karyawan?.nama).join(', ')} di-set OFF tapi memiliki SKPL di hari ini.
                    </span>
                </div>
            )}
            {showNotification && diubah.length > 0 && !loadingAbsensi && (
                <div className="alert alert-success mb-4">
                    ✓ <strong>{diubah.length} karyawan</strong> status absensinya sudah diubah.
                </div>
            )}
            {saved && (
                <div className="alert alert-success mb-4">
                    ✅ Data absensi berhasil disimpan!
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIK karyawan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                color: 'var(--text-dim)',
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Karyawan</th>
                                <th>Jabatan</th>
                                <th style={{ textAlign: 'center' }}>Status Absensi</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingAbsensi ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        ⏳ Loading data presensi...
                                    </td>
                                </tr>
                            ) : filteredAbsensi.length === 0 && absensiHariIni.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">👥</div>
                                            <div className="empty-state-title">Tidak ada karyawan terjadwal</div>
                                            <div className="empty-state-desc">Tidak ada karyawan yang terjadwal untuk hari ini berdasarkan periode shift</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredAbsensi.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                                            Tidak ada karyawan yang cocok dengan pencarian "{searchQuery}"
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAbsensi.map((a, i) => {
                                    const karyawan = a.karyawan;
                                    const currentStatus = (a.status as StatusAbsensi) || null;
                                    const origStatus = originalStatus[a.id_karyawan];
                                    const hasConflict = currentStatus === 'OFF' && currentStatus !== origStatus && skplHariIni.some((s) => s.karyawanList?.some((k) => k.id === a.id_karyawan));
                                    return (
                                        <tr key={a.id} style={hasConflict ? { background: 'rgba(245,158,11,0.05)' } : {}}>
                                            <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{karyawan?.nama}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{karyawan?.nik}</div>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)' }}>{karyawan?.jabatan}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleSetStatus(a.id_karyawan, s)}
                                                            style={{
                                                                padding: '5px 12px',
                                                                borderRadius: '20px',
                                                                border: `1.5px solid ${currentStatus === s ? STATUS_COLORS[s] : 'var(--border)'}`,
                                                                background: currentStatus === s ? STATUS_COLORS[s] + '22' : 'transparent',
                                                                color: currentStatus === s ? STATUS_COLORS[s] : 'var(--text-dim)',
                                                                fontSize: '12px',
                                                                fontWeight: currentStatus === s ? 700 : 400,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    className="form-input"
                                                    placeholder="Keterangan (opsional)"
                                                    style={{ fontSize: '12px', padding: '6px 10px' }}
                                                    value={keterangan[a.id_karyawan] || ''}
                                                    onChange={(e) => setKeterangan({ ...keterangan, [a.id_karyawan]: e.target.value })}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {absensiHariIni.length > 0 && !loadingAbsensi && (
                    <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            Terisi: <strong style={{ color: 'var(--accent-green)' }}>{filteredAbsensi.length - filteredAbsensi.filter(a => originalStatus[a.id_karyawan] === (a.status as StatusAbsensi)).length}</strong> / {filteredAbsensi.length} karyawan
                        </div>
                        <button className="btn btn-primary" onClick={handleSaveAll}>
                            <Save size={16} /> Simpan Semua
                        </button>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="card" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Keterangan:</strong>
                    {STATUS_OPTIONS.map((s) => (
                        <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], display: 'inline-block' }} />
                            {s} = {s === 'DS' ? 'Day Shift' : s === 'NS' ? 'Night Shift' : s === 'OFF' ? 'Libur' : s === 'S' ? 'Sakit' : s === 'I' ? 'Izin' : 'Alpa'}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
