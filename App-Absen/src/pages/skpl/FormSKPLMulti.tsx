import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Search, Printer, ArrowLeft, X } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import { useSKPLStore } from '../../store/skplStore';

function calcTotalJam(mulai: string, selesai: string): number {
    const [hm, mm] = mulai.split(':').map(Number);
    const [hs, ms] = selesai.split(':').map(Number);
    let diff = (hs * 60 + ms) - (hm * 60 + mm);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 60 * 10) / 10;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function FormSKPLMulti() {
    const navigate = useNavigate();
    const { karyawanList } = useKaryawanStore();
    const { addSKPL, loading: skplLoading } = useSKPLStore();

    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedKaryawan, setSelectedKaryawan] = useState<typeof karyawanList>([]);
    const [tanggal, setTanggal] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [jam_mulai, setJamMulai] = useState('17:00');
    const [jam_selesai, setJamSelesai] = useState('21:00');
    const [aktivitas, setAktivitas] = useState('');
    const [lokasi, setLokasi] = useState('PSTB');
    const [keterangan, setKeterangan] = useState('');
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const totalJam = useMemo(() => calcTotalJam(jam_mulai, jam_selesai), [jam_mulai, jam_selesai]);

    const filteredKaryawan = karyawanList.filter(
        (k) => 
            k.status_aktif && 
            !selectedKaryawan.find(sk => sk.id === k.id) &&
            (k.nama.toLowerCase().includes(search.toLowerCase()) || k.nik.includes(search))
    );

    const handleSelectKaryawan = (k: typeof karyawanList[0]) => {
        setSelectedKaryawan([...selectedKaryawan, k]);
        setSearch('');
        setShowDropdown(false);
    };

    const handleRemoveKaryawan = (id: string) => {
        setSelectedKaryawan(selectedKaryawan.filter(k => k.id !== id));
    };

    const handleSave = async (andPrint = false) => {
        if (selectedKaryawan.length === 0 || !tanggal || !aktivitas) {
            setSaveError('Silakan pilih minimal 1 karyawan dan isi semua field yang diperlukan');
            return;
        }

        setSaveError(null);
        try {
            await addSKPL({ 
                tanggal, 
                jam_mulai, 
                jam_selesai, 
                total_jam: totalJam, 
                aktivitas,
                lokasi,
                keterangan,
                idKaryawanList: selectedKaryawan.map(k => k.id)
            });
            setSaved(true);
            
            if (andPrint) {
                await handlePrint();
            } else {
                setTimeout(() => navigate('/skpl'), 1000);
            }
        } catch (err) {
            setSaveError((err as Error).message);
        }
    };

    const handlePrint = async () => {
        try {
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            const logoDataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });

            const formatDate = (dateStr: string) => {
                const d = new Date(dateStr);
                const day = String(d.getDate()).padStart(2, '0');
                const year = d.getFullYear();
                return `${day} ${MONTHS[d.getMonth()]} ${year}`;
            };

            const karyawanRows = selectedKaryawan.map((k, idx) => `
                <tr>
                    <td class="center">${idx + 1}</td>
                    <td>${k.nama}</td>
                    <td class="center">${k.nik}</td>
                    <td class="center">${k.jabatan}</td>
                    <td class="center">${jam_mulai}</td>
                    <td class="center">${jam_selesai}</td>
                    <td class="center">${totalJam} Jam</td>
                    <td>${keterangan || '-'}</td>
                </tr>
            `).join('');

            const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>SKPL</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Times New Roman', Arial, sans-serif; 
            padding: 20px 30px; 
            color: #000; 
            line-height: 1.4;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header-top {
            position: relative;
            margin-bottom: 15px;
            min-height: 60px;
        }
        .header-title {
            text-align: center;
        }
        .header-title h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 0.5px;
            font-style: normal;
        }
        .header-top .logo {
            position: absolute;
            right: 0;
            top: 0;
            text-align: right;
        }
        .logo img {
            height: 50px;
            max-width: 150px;
        }
        .header-section {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .info-section {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 15px 30px;
            font-size: 11px;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .info-row {
            display: contents;
        }
        .info-label {
            font-weight: bold;
        }
        .info-value {
            text-align: left;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 11px;
        }
        th {
            border: 1px solid #000;
            padding: 6px 6px;
            text-align: center;
            background: #f5f5f5;
            font-weight: bold;
            font-size: 10px;
        }
        td {
            border: 1px solid #000;
            padding: 6px 6px;
            text-align: left;
        }
        td.center { text-align: center; }
        .footer-note {
            font-size: 10px;
            margin-top: 15px;
            line-height: 1.4;
        }
        .footer-note strong {
            display: block;
            margin-bottom: 3px;
        }
        .signature-section {
            margin-top: 40px;
            text-align: right;
            font-size: 10px;
        }
        .sig-date {
            margin-bottom: 30px;
        }
        .sig-title {
            margin-bottom: 40px;
            font-weight: bold;
        }
        .sig-name {
            margin-top: 5px;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-top">
            <div class="header-title">
                <h1>SURAT PERMINTAAN KERJA LEMBUR (SKPL)</h1>
            </div>
            <div class="logo">
                <img src="${logoDataUrl}" alt="Pertamina Trans Kontinental" />
            </div>
        </div>
        <div class="header-section"></div>
        
        <div class="info-section">
            <div class="info-row">
                <span class="info-label">TANGGAL</span>
                <span class="info-value">: ${formatDate(tanggal)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">LOCATION</span>
                <span class="info-value">: ${lokasi || 'PSTB'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">KETERANGAN</span>
                <span class="info-value">: ${keterangan || '-'}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>NO</th>
                    <th>NAMA</th>
                    <th>NO PEKERJA</th>
                    <th>JABATAN</th>
                    <th>JAM KERJA</th>
                    <th>&nbsp;</th>
                    <th>TOTAL JAM KERJA</th>
                    <th>KETERANGAN</th>
                </tr>
            </thead>
            <tbody>
                ${karyawanRows}
            </tbody>
        </table>

        <div class="footer-note">
            <strong>*Warna Biru adalah hari libur Nasional/Kerja</strong>
            <p>Jumlah jam lembur<br/>
            Kolom jam bersih, tidak diperhitungkan<br/>
            adanya coretan/perubahan.</p>
        </div>

        <div class="signature-section">
            <div class="sig-date">${formatDate(tanggal)}</div>
            <div class="sig-title">Shorebase Operation Manager,</div>
            <div style="height: 50px;"></div>
            <div class="sig-name">____________________</div>
        </div>
    </div>
</body>
</html>
            `;
            
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(printContent);
                win.document.close();
                const img = win.document.querySelector('img');
                if (img) {
                    img.onload = () => setTimeout(() => win.print(), 250);
                } else {
                    setTimeout(() => win.print(), 250);
                }
            }
        } catch (err) {
            console.error('Failed to print:', err);
            setSaveError('Gagal membuka print preview');
        }
    };

    return (
        <div className="page-content">
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                {/* Header */}
                <div className="page-header" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={() => navigate('/skpl')}
                            className="btn-icon"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="page-title">SKPL Baru</h1>
                        </div>
                    </div>
                </div>

                {/* Card Container */}
                <div className="card">
                    {saveError && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'var(--accent-red-dim)',
                            color: 'var(--accent-red)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '16px',
                            fontSize: '13px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}>
                            {saveError}
                        </div>
                    )}

                    {saved && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: 'var(--accent-green-dim)',
                            color: 'var(--accent-green)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '16px',
                            fontSize: '13px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}>
                            ✓ SKPL berhasil dibuat! Redirecting...
                        </div>
                    )}

                    {/* Karyawan Multi-Select */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">
                            Pilih Karyawan <span style={{ color: 'var(--accent-red)' }}>*</span>
                        </label>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <input
                                type="text"
                                placeholder="Cari nama atau NIK karyawan..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                className="form-input"
                            />
                            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />

                            {showDropdown && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    marginTop: '4px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    zIndex: 10,
                                    boxShadow: 'var(--shadow-md)',
                                }}>
                                    {filteredKaryawan.length === 0 ? (
                                        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px' }}>
                                            Tidak ada karyawan
                                        </div>
                                    ) : (
                                        filteredKaryawan.map((k) => (
                                            <div
                                                key={k.id}
                                                onClick={() => handleSelectKaryawan(k)}
                                                style={{
                                                    padding: '10px 12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--border)',
                                                    fontSize: '13px',
                                                    transition: 'var(--transition)',
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-glass-hover)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{k.nama}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{k.nik} - {k.jabatan}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Karyawan Tag */}
                        {selectedKaryawan.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {selectedKaryawan.map((k) => (
                                    <div
                                        key={k.id}
                                        className="badge"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            backgroundColor: 'var(--accent-blue-dim)',
                                            color: 'var(--accent-blue-light)',
                                            padding: '6px 10px',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                        }}
                                    >
                                        {k.nama}
                                        <button
                                            onClick={() => handleRemoveKaryawan(k.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'inherit',
                                                marginLeft: '4px',
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                            {selectedKaryawan.length} karyawan dipilih
                        </div>
                    </div>

                    {/* Tanggal */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">
                            Tanggal <span style={{ color: 'var(--accent-red)' }}>*</span>
                        </label>
                        <input
                            type="date"
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    {/* Jam Mulai & Selesai */}
                    <div className="form-row" style={{ marginBottom: '20px' }}>
                        <div className="form-group">
                            <label className="form-label">
                                Jam Mulai <span style={{ color: 'var(--accent-red)' }}>*</span>
                            </label>
                            <input
                                type="time"
                                value={jam_mulai}
                                onChange={(e) => setJamMulai(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">
                                Jam Selesai <span style={{ color: 'var(--accent-red)' }}>*</span>
                            </label>
                            <input
                                type="time"
                                value={jam_selesai}
                                onChange={(e) => setJamSelesai(e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Total Jam */}
                    <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid var(--border)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Total Jam Kerja:</strong> <span style={{ color: 'var(--accent-yellow)', fontWeight: '600' }}>{totalJam} Jam</span>
                    </div>

                    {/* Aktivitas */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">
                            Aktivitas <span style={{ color: 'var(--accent-red)' }}>*</span>
                        </label>
                        <textarea
                            value={aktivitas}
                            onChange={(e) => setAktivitas(e.target.value)}
                            placeholder="Deskripsi aktivitas lemburan..."
                            className="form-textarea"
                        />
                    </div>

                    {/* Lokasi */}
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">
                            Lokasi <span style={{ color: 'var(--accent-red)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={lokasi}
                            onChange={(e) => setLokasi(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">Keterangan (Opsional)</label>
                        <textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Catatan tambahan..."
                            className="form-textarea"
                            style={{ minHeight: '60px' }}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="form-row" style={{ gap: '12px' }}>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={skplLoading || saved}
                            className="btn btn-success"
                            style={{ width: '100%' }}
                        >
                            {skplLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={skplLoading || saved}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            <Printer size={16} />
                            {skplLoading ? 'Menyimpan...' : 'Simpan & Print'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
