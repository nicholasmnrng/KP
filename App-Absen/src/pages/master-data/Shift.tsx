import { useShiftStore } from '../../store/shiftStore';

export default function ShiftPage() {
    const { shifts, loading, error, updateShift } = useShiftStore();

    const calcDurasi = (mulai: string, selesai: string): number => {
        const [hm, mm] = mulai.split(':').map(Number);
        const [hs, ms] = selesai.split(':').map(Number);
        let diff = (hs * 60 + ms) - (hm * 60 + mm);
        if (diff < 0) diff += 24 * 60;
        return Math.round(diff / 60 * 10) / 10;
    };

    const handleChange = async (id: string, field: 'jam_mulai' | 'jam_selesai', value: string) => {
        const shift = shifts.find((s) => s.id === id)!;
        const mulai = field === 'jam_mulai' ? value : shift.jam_mulai;
        const selesai = field === 'jam_selesai' ? value : shift.jam_selesai;
        try {
            await updateShift(id, { [field]: value, durasi_jam: calcDurasi(mulai, selesai) });
        } catch (err) {
            alert('Gagal update shift: ' + (err as Error).message);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Shift Management</h1>
                    <p className="page-subtitle">Konfigurasi jam kerja Shift Pagi dan Shift Malam</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div style={{ 
                    padding: '12px 16px', 
                    marginBottom: '16px', 
                    backgroundColor: '#fee', 
                    border: '1px solid #fcc', 
                    borderRadius: '6px',
                    color: '#c33'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading shifts...</div>
            ) : (
                <>
                    <div className="grid-2">
                        {shifts.map((shift) => {
                            const isPagi = shift.nama.toLowerCase().includes('pagi');
                            return (
                                <div key={shift.id} className="card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                            background: isPagi ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
                                        }}>
                                            {isPagi ? '☀️' : '🌙'}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{shift.nama}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                Durasi: <strong style={{ color: isPagi ? 'var(--accent-green)' : 'var(--accent-yellow)' }}>
                                                    {shift.durasi_jam} jam
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Jam Mulai</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={shift.jam_mulai}
                                                onChange={(e) => handleChange(shift.id, 'jam_mulai', e.target.value)}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Jam Selesai</label>
                                            <input
                                                type="time"
                                                className="form-input"
                                                value={shift.jam_selesai}
                                                onChange={(e) => handleChange(shift.id, 'jam_selesai', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="alert alert-info" style={{ marginTop: '16px' }}>
                                        ℹ️ Perubahan jam shift akan menjadi acuan perhitungan lembur pada SKPL.
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="card" style={{ marginTop: '16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                            📋 Keterangan Status Absensi
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            {[
                                { code: 'Hadir', label: 'Hadir', color: '#10b981', desc: 'Masuk kerja' },
                                { code: 'Lembur', label: 'Lembur', color: '#f59e0b', desc: 'Masuk lembur' },
                                { code: 'OFF', label: 'Off / Libur', color: '#6b7280', desc: 'Hari libur / off' },
                                { code: 'Sakit', label: 'Sakit', color: '#3b82f6', desc: 'Tidak masuk sakit' },
                                { code: 'Izin', label: 'Izin', color: '#8b5cf6', desc: 'Tidak masuk izin' },
                            ].map((s) => (
                                <div key={s.code} style={{
                                    padding: '12px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: s.color }}>{s.code}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
