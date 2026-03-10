import { useState } from 'react';
import { getDaysInMonth } from 'date-fns';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import { useAbsensiStore } from '../../store/absensiStore';
import { useSKPLStore } from '../../store/skplStore';
import type { StatusAbsensi } from '../../types';
import * as XLSX from 'xlsx';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ExportPage() {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [exportType] = useState<'absensi' | 'skpl'>('absensi');

    const { getAktifList } = useKaryawanStore();
    const { getStatusByKaryawanAndTanggal } = useAbsensiStore();
    const { getSKPLByBulan } = useSKPLStore();

    const aktifList = getAktifList();
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));

    const handleExportAbsensi = () => {
        const headers = ['No', 'NIK', 'Nama', 'Jabatan', 'Departemen',
            ...Array.from({ length: daysInMonth }, (_, i) => String(i + 1)),
            'Total DS', 'Total NS', 'Total OFF', 'Total S', 'Total I', 'Total A'
        ];
        const rows = aktifList.map((k, i) => {
            const summary: Record<StatusAbsensi, number> = { DS: 0, NS: 0, OFF: 0, S: 0, I: 0, A: 0 };
            const days = Array.from({ length: daysInMonth }, (_, d) => {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d + 1).padStart(2, '0')}`;
                const s = getStatusByKaryawanAndTanggal(k.id, dateStr);
                if (s) summary[s]++;
                return s ?? '-';
            });
            return [i + 1, k.nik, k.nama, k.jabatan, k.departemen, ...days, summary.DS, summary.NS, summary.OFF, summary.S, summary.I, summary.A];
        });
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        // Style header row width
        ws['!cols'] = [8, 12, 25, 20, 20, ...Array(daysInMonth).fill(5), 8, 8, 8, 8, 8, 8].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Absensi ${MONTHS[month - 1]} ${year}`);
        XLSX.writeFile(wb, `Rekap_Absensi_${MONTHS[month - 1]}_${year}.xlsx`);
    };

    const handleExportSKPL = () => {
        const skplBulan = getSKPLByBulan(year, month);
        const headers = ['No', 'Tanggal', 'NIK', 'Nama', 'Jabatan', 'Departemen', 'Jam Mulai', 'Jam Selesai', 'Total Jam', 'Aktivitas'];
        const rows: any[] = [];
        let rowNum = 1;
        
        skplBulan.forEach((s) => {
            if (s.karyawanList && s.karyawanList.length > 0) {
                s.karyawanList.forEach((k) => {
                    rows.push([rowNum++, s.tanggal, k.nik, k.nama, k.jabatan, k.departemen, s.jam_mulai, s.jam_selesai, s.total_jam.toFixed(1), s.aktivitas]);
                });
            } else {
                rows.push([rowNum++, s.tanggal, '-', '-', '-', '-', s.jam_mulai, s.jam_selesai, s.total_jam.toFixed(1), s.aktivitas]);
            }
        });
        
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        ws['!cols'] = [5, 12, 12, 25, 20, 20, 10, 10, 10, 40].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `SKPL ${MONTHS[month - 1]} ${year}`);
        XLSX.writeFile(wb, `SKPL_${MONTHS[month - 1]}_${year}.xlsx`);
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Export Data</h1>
                    <p className="page-subtitle">Unduh data absensi dan SKPL dalam format Excel</p>
                </div>
            </div>

            {/* Period selector */}
            <div className="card mb-6">
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>Pilih Periode</h3>
                <div className="flex items-center gap-3">
                    <select className="form-select" style={{ width: 160 }} value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 100 }} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Export options */}
            <div className="grid-2">
                <div className="card" style={{ border: exportType === 'absensi' ? '1px solid var(--accent-blue)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileSpreadsheet size={24} color="#10b981" />
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Rekap Absensi</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Format Excel (.xlsx) untuk Payroll</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                        Tabel lengkap absensi 1–{daysInMonth} hari untuk semua karyawan aktif beserta rekap total per status.
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: 16 }}>
                        📋 {aktifList.length} karyawan · {daysInMonth} hari · {MONTHS[month - 1]} {year}
                    </div>
                    <button className="btn btn-success w-full" onClick={handleExportAbsensi}>
                        <Download size={16} /> Export Absensi Excel
                    </button>
                </div>

                <div className="card" style={{ border: exportType === 'skpl' ? '1px solid var(--accent-blue)' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Data SKPL</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Format Excel (.xlsx) untuk Keuangan</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                        Daftar semua Surat Permintaan Kerja Lembur bulan ini beserta total jam lembur per karyawan.
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: 16 }}>
                        📄 {getSKPLByBulan(year, month).length} SKPL · {MONTHS[month - 1]} {year}
                    </div>
                    <button className="btn btn-primary w-full" onClick={handleExportSKPL}>
                        <Download size={16} /> Export SKPL Excel
                    </button>
                </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: 16 }}>
                💡 File Excel akan langsung terunduh ke folder Downloads Anda. Buka dengan Microsoft Excel atau Google Sheets.
            </div>
        </div>
    );
}
