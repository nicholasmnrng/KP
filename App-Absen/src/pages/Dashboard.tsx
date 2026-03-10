import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    Users, UserCheck, UserX, Clock, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { useKaryawanStore } from '../store/karyawanStore';
import { useAbsensiStore } from '../store/absensiStore';
import { useSKPLStore } from '../store/skplStore';
import type { StatusAbsensi } from '../types';

const STATUS_COLORS: Record<StatusAbsensi, string> = {
    DS: '#10b981',
    NS: '#f59e0b',
    OFF: '#6b7280',
    S: '#3b82f6',
    I: '#8b5cf6',
    A: '#ef4444',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLabel = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

    const { getAktifList } = useKaryawanStore();
    const { getAbsensiByTanggal } = useAbsensiStore();
    const { getSKPLByTanggal, loading, error } = useSKPLStore();

    const aktifList = getAktifList();
    const absensiHariIni = getAbsensiByTanggal(today);
    const skplHariIni = getSKPLByTanggal(today);

    // Count statuses
    const statusCount: Record<StatusAbsensi, number> = { DS: 0, NS: 0, OFF: 0, S: 0, I: 0, A: 0 };
    absensiHariIni.forEach((a) => {
        if (a.status in statusCount) statusCount[a.status as StatusAbsensi]++;
    });

    const hadirCount = statusCount.DS + statusCount.NS;
    const absenCount = statusCount.S + statusCount.I + statusCount.A;
    const belumDiisi = aktifList.length - absensiHariIni.length;

    const pieData = (Object.entries(statusCount) as [StatusAbsensi, number][])
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: k, value: v, color: STATUS_COLORS[k] }));

    return (
        <div>
            {/* Welcome */}
            <div className="mb-6">
                <h1 className="page-title">Selamat Datang, Admin 👋</h1>
                <p className="page-subtitle">{todayLabel} · Pertamina Shorebase Tanjung Batu</p>
            </div>

            {/* Warning if ada yang belum diisi */}
            {belumDiisi > 0 && (
                <div className="alert alert-warning mb-6">
                    <AlertTriangle size={16} />
                    <span>
                        <strong>{belumDiisi} karyawan</strong> belum diisi status absensinya hari ini.{' '}
                        <button
                            onClick={() => navigate('/presensi/harian')}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        >
                            Input sekarang →
                        </button>
                    </span>
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid-4 mb-6">
                <div className="stat-card" style={{ '--stat-color': '#3b82f6', '--stat-bg': 'rgba(59,130,246,0.12)' } as React.CSSProperties}>
                    <div className="stat-icon"><Users size={22} color="#3b82f6" /></div>
                    <div className="stat-info">
                        <div className="stat-value">{aktifList.length}</div>
                        <div className="stat-label">Total Karyawan Aktif</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#10b981', '--stat-bg': 'rgba(16,185,129,0.12)' } as React.CSSProperties}>
                    <div className="stat-icon"><UserCheck size={22} color="#10b981" /></div>
                    <div className="stat-info">
                        <div className="stat-value">{hadirCount}</div>
                        <div className="stat-label">Hadir Hari Ini</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#ef4444', '--stat-bg': 'rgba(239,68,68,0.12)' } as React.CSSProperties}>
                    <div className="stat-icon"><UserX size={22} color="#ef4444" /></div>
                    <div className="stat-info">
                        <div className="stat-value">{absenCount}</div>
                        <div className="stat-label">Tidak Hadir</div>
                    </div>
                </div>
                <div className="stat-card" style={{ '--stat-color': '#f59e0b', '--stat-bg': 'rgba(245,158,11,0.12)' } as React.CSSProperties}>
                    <div className="stat-icon"><Clock size={22} color="#f59e0b" /></div>
                    <div className="stat-info">
                        <div className="stat-value">{skplHariIni.length}</div>
                        <div className="stat-label">Lembur Hari Ini</div>
                    </div>
                </div>
            </div>

            {/* Charts + Lembur Watch */}
            <div className="grid-2 mb-6">
                {/* Pie Chart */}
                <div className="card">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                        📊 Status Kehadiran Hari Ini
                    </h3>
                    {pieData.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <div className="empty-state-icon">📋</div>
                            <div className="empty-state-title">Belum ada data</div>
                            <div className="empty-state-desc">Input absensi untuk melihat grafik</div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                    formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0} orang`, name ?? '']}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* Legend detail */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {(Object.entries(statusCount) as [StatusAbsensi, number][]).map(([status, count]) => (
                            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[status] }} />
                                {status}: <strong style={{ color: 'var(--text-secondary)' }}>{count}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lembur Watch */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            🔥 Lembur Watch
                        </h3>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/skpl')}>
                            Lihat Semua <ArrowRight size={14} />
                        </button>
                    </div>
                    {loading ? (
                        <div className="empty-state" style={{ padding: '40px 20px', color: 'var(--text-muted)' }}>
                            Memuat data...
                        </div>
                    ) : error ? (
                        <div className="empty-state" style={{ padding: '40px 20px', color: 'var(--accent-red)' }}>
                            Error: {error}
                        </div>
                    ) : skplHariIni.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px 20px' }}>
                            <div className="empty-state-icon">✅</div>
                            <div className="empty-state-title">Tidak ada lembur hari ini</div>
                            <div className="empty-state-desc">Semua karyawan selesai tepat waktu</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {skplHariIni.map((skpl) => {
                                const karyawanCount = (skpl.karyawanList || []).length;
                                const karyawanName = karyawanCount > 1
                                    ? `${karyawanCount} Karyawan`
                                    : (skpl.karyawanList?.[0]?.nama ?? 'Unknown');
                                const jabatan = karyawanCount > 1
                                    ? ''
                                    : (skpl.karyawanList?.[0]?.jabatan ?? '');
                                return (
                                    <div key={skpl.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '10px 14px',
                                        background: 'var(--bg-glass)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {karyawanName}
                                            </div>
                                            {jabatan && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    {jabatan}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--accent-yellow)', fontWeight: 600 }}>
                                                {skpl.jam_mulai} – {skpl.jam_selesai}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {skpl.total_jam.toFixed(1)} jam
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    ⚡ Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate('/presensi/harian')}>
                        📋 Input Absen Hari Ini
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/skpl/baru')}>
                        📄 Buat SKPL Baru
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/laporan/bulanan')}>
                        📊 Lihat Rekap Bulanan
                    </button>
                    <button className="btn btn-secondary btn-lg" onClick={() => navigate('/master-data/karyawan')}>
                        👥 Kelola Karyawan
                    </button>
                </div>
            </div>
        </div>
    );
}
