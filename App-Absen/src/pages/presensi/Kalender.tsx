import { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import { useAbsensiStore } from '../../store/absensiStore';
import { useSKPLStore } from '../../store/skplStore';
import { useKaryawanShiftStore } from '../../store/karyawanShiftStore';
import type { StatusAbsensi } from '../../types';

const STATUS_COLORS: Record<StatusAbsensi, string> = {
    DS: '#10b981', NS: '#f59e0b', OFF: '#6b7280', S: '#3b82f6', I: '#8b5cf6', A: '#ef4444',
};

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function KalenderPage() {
    const [selectedKaryawanId, setSelectedKaryawanId] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const { karyawanList } = useKaryawanStore();
    const { getAbsensiByKaryawanAndBulan, getStatusByKaryawanAndTanggal } = useAbsensiStore();
    const { getSKPLByKaryawan } = useSKPLStore();
    const { shiftList, fetchByKaryawan } = useKaryawanShiftStore();

    // Fetch shift data when karyawan is selected
    useEffect(() => {
        if (selectedKaryawanId) {
            fetchByKaryawan(selectedKaryawanId);
        }
    }, [selectedKaryawanId, fetchByKaryawan]);

    const karyawan = karyawanList.find((k) => k.id === selectedKaryawanId);
    const absensiList = selectedKaryawanId ? getAbsensiByKaryawanAndBulan(selectedKaryawanId, year, month) : [];
    const skplList = selectedKaryawanId ? getSKPLByKaryawan(selectedKaryawanId).filter((s) => {
        const d = new Date(s.tanggal);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
    }) : [];

    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const firstDayOfWeek = getDay(startOfMonth(new Date(year, month - 1)));

    // Get shift for a specific date
    const getShiftByDate = (dateStr: string): 'DS' | 'NS' | 'OFF' | null => {
        const shift = shiftList.find((s) => {
            const startDate = new Date(s.tanggal_mulai);
            const endDate = new Date(s.tanggal_selesai);
            const date = new Date(dateStr);
            return date >= startDate && date <= endDate;
        });
        return shift?.shift?.nama as 'DS' | 'NS' | 'OFF' | null || null;
    };

    // Count summary - include shifts from karyawan_shift
    const summary: Record<StatusAbsensi, number> = { DS: 0, NS: 0, OFF: 0, S: 0, I: 0, A: 0 };
    
    // Count from absensi
    absensiList.forEach((a) => { if (a.status in summary) summary[a.status as StatusAbsensi]++; });
    
    // Count from shifts for current month if no absensi recorded
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasAbsensi = absensiList.some(a => a.tanggal === dateStr);
        if (!hasAbsensi) {
            const shift = getShiftByDate(dateStr);
            if (shift && shift in summary) {
                summary[shift as StatusAbsensi]++;
            }
        }
    }
    
    const totalLemburJam = skplList.reduce((acc, s) => acc + s.total_jam, 0);

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(year - 1); }
        else setMonth(month - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(year + 1); }
        else setMonth(month + 1);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Kalender Individu</h1>
                    <p className="page-subtitle">Riwayat absensi per karyawan</p>
                </div>
            </div>

            {/* Pilih Karyawan */}
            <div className="card mb-4">
                <div className="form-group">
                    <label className="form-label">Pilih Karyawan</label>
                    <select
                        className="form-select"
                        value={selectedKaryawanId}
                        onChange={(e) => setSelectedKaryawanId(e.target.value)}
                    >
                        <option value="">-- Pilih karyawan --</option>
                        {karyawanList.map((k) => (
                            <option key={k.id} value={k.id}>{k.nama} ({k.nik})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedKaryawanId && karyawan ? (
                <>
                    {/* Karyawan Info */}
                    <div className="card mb-4" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 700, color: 'white', flexShrink: 0
                        }}>
                            {karyawan.nama.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{karyawan.nama}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                NIK: {karyawan.nik} · {karyawan.jabatan} · {karyawan.departemen}
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="card mb-4">
                        {/* Month Nav */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={prevMonth}><ChevronLeft size={16} /></button>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {MONTHS[month - 1]} {year}
                            </span>
                            <button className="btn btn-secondary btn-sm" onClick={nextMonth}><ChevronRight size={16} /></button>
                        </div>

                        {/* Day headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                            {DAYS.map((d) => (
                                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', padding: '4px' }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {/* Empty cells for first week */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {/* Days */}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const status = getStatusByKaryawanAndTanggal(selectedKaryawanId, dateStr);
                                const shift = getShiftByDate(dateStr);
                                const displayStatus = status || shift; // Show absensi status first, then shift
                                const hasSkpl = skplList.some((s) => s.tanggal === dateStr);
                                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

                                return (
                                    <div key={day} style={{
                                        padding: '8px 4px',
                                        borderRadius: 'var(--radius-md)',
                                        textAlign: 'center',
                                        background: displayStatus ? STATUS_COLORS[displayStatus] + '18' : 'var(--bg-glass)',
                                        border: `1px solid ${isToday ? 'var(--accent-blue)' : displayStatus ? STATUS_COLORS[displayStatus] + '40' : 'var(--border)'}`,
                                        position: 'relative',
                                    }}>
                                        <div style={{ fontSize: '12px', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent-blue-light)' : 'var(--text-secondary)' }}>
                                            {day}
                                        </div>
                                        {displayStatus && (
                                            <div style={{ fontSize: '10px', fontWeight: 700, color: STATUS_COLORS[displayStatus], marginTop: '2px' }}>
                                                {displayStatus}
                                            </div>
                                        )}
                                        {hasSkpl && (
                                            <div style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} title="Ada SKPL" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            {(Object.entries(STATUS_COLORS) as [StatusAbsensi, string][]).map(([s, c]) => (
                                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                                    {s}
                                </span>
                            ))}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
                                Ada SKPL
                            </span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card">
                        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                            📊 Rekap {MONTHS[month - 1]} {year}
                        </h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {(Object.entries(summary) as [StatusAbsensi, number][]).map(([s, count]) => (
                                <div key={s} style={{
                                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                    background: STATUS_COLORS[s] + '15', border: `1px solid ${STATUS_COLORS[s]}30`,
                                    textAlign: 'center', minWidth: 70
                                }}>
                                    <div style={{ fontSize: '22px', fontWeight: 700, color: STATUS_COLORS[s] }}>{count}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s}</div>
                                </div>
                            ))}
                            <div style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                                textAlign: 'center', minWidth: 70
                            }}>
                                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f97316' }}>{totalLemburJam.toFixed(1)}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Jam Lembur</div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📅</div>
                        <div className="empty-state-title">Pilih karyawan untuk melihat kalender</div>
                        <div className="empty-state-desc">Gunakan dropdown di atas untuk memilih karyawan</div>
                    </div>
                </div>
            )}
        </div>
    );
}
