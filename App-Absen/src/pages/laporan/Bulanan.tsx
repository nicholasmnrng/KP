import { useState } from 'react';
import { getDaysInMonth } from 'date-fns';

import { useKaryawanStore } from '../../store/karyawanStore';
import { useAbsensiStore } from '../../store/absensiStore';
import { useSKPLStore } from '../../store/skplStore';
import type { StatusAbsensi } from '../../types';
import * as XLSX from 'xlsx';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const STATUS_COLORS: Record<StatusAbsensi, string> = {
    DS: '#10b981', NS: '#f59e0b', OFF: '#6b7280', S: '#3b82f6', I: '#8b5cf6', A: '#ef4444',
};

export default function LaporanBulanan() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const { getAktifList } = useKaryawanStore();
    const { getStatusByKaryawanAndTanggal } = useAbsensiStore();
    const { getSKPLByBulan } = useSKPLStore();

    const aktifList = getAktifList();
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const skplBulan = getSKPLByBulan(year, month);

    const getStatus = (idKaryawan: string, day: number): StatusAbsensi | null => {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return getStatusByKaryawanAndTanggal(idKaryawan, dateStr);
    };

    const getSummary = (idKaryawan: string) => {
        const summary: Record<StatusAbsensi, number> = { DS: 0, NS: 0, OFF: 0, S: 0, I: 0, A: 0 };
        for (let d = 1; d <= daysInMonth; d++) {
            const s = getStatus(idKaryawan, d);
            if (s) summary[s]++;
        }
        const lemburKali = skplBulan.filter((s) => s.karyawanList?.some((k) => k.id === idKaryawan)).length;
        const lemburJam = skplBulan.filter((s) => s.karyawanList?.some((k) => k.id === idKaryawan)).reduce((acc, s) => acc + s.total_jam, 0);
        return { ...summary, lemburKali, lemburJam };
    };

    const handleExportExcel = () => {
        const headers = ['No', 'NIK', 'Nama', 'Jabatan', ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)), 'DS', 'NS', 'OFF', 'S', 'I', 'A', 'Lembur (kali)', 'Lembur (jam)'];
        const rows = aktifList.map((k, i) => {
            const summary = getSummary(k.id);
            const days = Array.from({ length: daysInMonth }, (_, d) => getStatus(k.id, d + 1) ?? '-');
            return [i + 1, k.nik, k.nama, k.jabatan, ...days, summary.DS, summary.NS, summary.OFF, summary.S, summary.I, summary.A, summary.lemburKali, summary.lemburJam.toFixed(1)];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Rekap ${MONTHS[month - 1]} ${year}`);
        XLSX.writeFile(wb, `Rekap_Absensi_${MONTHS[month - 1]}_${year}.xlsx`);
    };

    const handlePrintPDF = () => {
        window.print();
    };

    return (
        <div>
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Rekap Bulanan</h1>
                    <p className="page-subtitle">Laporan presensi semua karyawan</p>
                </div>
                <div className="flex items-center gap-3" style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                    <select className="form-select" style={{ width: 150 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 90 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="btn btn-success" onClick={handleExportExcel}>
                        📊 Export Excel
                    </button>
                    <button className="btn btn-secondary" onClick={handlePrintPDF}>
                        📄 Print PDF
                    </button>
                </div>
            </div>

            <div className="card">
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Rekap Presensi — {MONTHS[month - 1]} {year} · {aktifList.length} karyawan
                </div>
                <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                    <table className="table" style={{ minWidth: 800, fontSize: '11px' }}>
                        <thead>
                            <tr>
                                <th style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2, padding: '6px 4px' }}>No</th>
                                <th style={{ position: 'sticky', left: 32, background: 'var(--bg-card)', zIndex: 2, minWidth: 120, padding: '6px 4px' }}>Nama</th>
                                {Array.from({ length: daysInMonth }, (_, i) => (
                                    <th key={i + 1} style={{ textAlign: 'center', minWidth: 24, padding: '6px 2px', fontSize: '10px' }}>{i + 1}</th>
                                ))}
                                <th style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', textAlign: 'center', padding: '6px 4px' }}>DS</th>
                                <th style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--accent-yellow)', textAlign: 'center', padding: '6px 4px' }}>NS</th>
                                <th style={{ background: 'rgba(107,114,128,0.1)', color: 'var(--accent-gray)', textAlign: 'center', padding: '6px 4px' }}>OFF</th>
                                <th style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue-light)', textAlign: 'center', padding: '6px 4px' }}>S</th>
                                <th style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', textAlign: 'center', padding: '6px 4px' }}>I</th>
                                <th style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', textAlign: 'center', padding: '6px 4px' }}>A</th>
                                <th style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', textAlign: 'center', padding: '6px 4px' }}>LBR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aktifList.length === 0 ? (
                                <tr><td colSpan={daysInMonth + 9}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📊</div>
                                        <div className="empty-state-title">Belum ada data</div>
                                        <div className="empty-state-desc">Tambahkan karyawan dan input absensi terlebih dahulu</div>
                                    </div>
                                </td></tr>
                            ) : (
                                aktifList.map((k, i) => {
                                    const summary = getSummary(k.id);
                                    return (
                                        <tr key={k.id} style={{ height: 36 }}>
                                            <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', color: 'var(--text-dim)', padding: '4px 4px', fontSize: '11px' }}>{i + 1}</td>
                                            <td style={{ position: 'sticky', left: 32, background: 'var(--bg-card)', fontWeight: 600, color: 'var(--text-primary)', minWidth: 120, padding: '4px 4px', fontSize: '11px' }}>
                                                <div style={{ lineHeight: 1.2 }}>{k.nama}</div>
                                                <div style={{ fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1 }}>{k.jabatan}</div>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, d) => {
                                                const s = getStatus(k.id, d + 1);
                                                return (
                                                    <td key={d + 1} style={{ textAlign: 'center', padding: '3px 1px', fontSize: '10px' }}>
                                                        {s ? (
                                                            <span style={{
                                                                fontSize: '9px', fontWeight: 700, color: STATUS_COLORS[s],
                                                                background: STATUS_COLORS[s] + '20',
                                                                padding: '1px 3px', borderRadius: 3, display: 'block'
                                                            }}>{s}</span>
                                                        ) : (
                                                            <span style={{ fontSize: '9px', color: 'var(--text-dim)' }}>-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-green)', padding: '4px 2px', fontSize: '11px' }}>{summary.DS}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-yellow)', padding: '4px 2px', fontSize: '11px' }}>{summary.NS}</td>
                                            <td style={{ textAlign: 'center', color: 'var(--accent-gray)', padding: '4px 2px', fontSize: '11px' }}>{summary.OFF}</td>
                                            <td style={{ textAlign: 'center', color: 'var(--accent-blue-light)', padding: '4px 2px', fontSize: '11px' }}>{summary.S}</td>
                                            <td style={{ textAlign: 'center', color: 'var(--accent-purple)', padding: '4px 2px', fontSize: '11px' }}>{summary.I}</td>
                                            <td style={{ textAlign: 'center', color: 'var(--accent-red)', padding: '4px 2px', fontSize: '11px' }}>{summary.A}</td>
                                            <td style={{ textAlign: 'center', color: '#f97316', fontWeight: 600, padding: '4px 2px', fontSize: '10px', lineHeight: 1.3 }}>
                                                {summary.lemburKali}x<br />
                                                <span style={{ fontSize: '9px', fontWeight: 400 }}>{summary.lemburJam.toFixed(1)}j</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: 8, fontSize: '11px', color: 'var(--text-dim)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span>DS=Day Shift</span><span>NS=Night Shift</span><span>OFF=Libur</span>
                    <span>S=Sakit</span><span>I=Izin</span><span>A=Alpa</span><span>LBR=Lembur</span>
                </div>
            </div>
        </div>
    );
}
