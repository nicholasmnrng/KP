import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Trash2, Printer, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSKPLStore } from '../../store/skplStore';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function DaftarSKPL() {
    const navigate = useNavigate();
    const { skplList, loading, error, deleteSKPL } = useSKPLStore();
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    const filtered = skplList.filter((s) => {
        const d = new Date(s.tanggal);
        return d.getFullYear() === filterYear && d.getMonth() + 1 === filterMonth;
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

    const totalJam = filtered.reduce((acc, s) => acc + s.total_jam, 0);

    const handleDelete = async (id: string) => {
        if (confirm('Hapus SKPL ini?')) {
            try {
                await deleteSKPL(id);
            } catch (err) {
                alert('Gagal menghapus SKPL: ' + (err as Error).message);
            }
        }
    };

    const handlePrint = async (skpl: typeof filtered[0]) => {
        const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            const day = String(d.getDate()).padStart(2, '0');
            const year = d.getFullYear();
            return `${day} ${MONTHS[d.getMonth()]} ${year}`;
        };
        
        try {
            // Fetch logo and convert to data URL
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            const logoDataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
            
            // Generate table rows for all karyawan
            const karyawanRows = (skpl.karyawanList || [])
                .map((k, idx) => `
                <tr>
                    <td class="center">${idx + 1}</td>
                    <td>${k.nama}</td>
                    <td>${k.nik}</td>
                    <td>${k.jabatan}</td>
                    <td class="center">${skpl.jam_mulai.substring(0,5)}<br>${skpl.jam_selesai.substring(0,5)}</td>
                    <td class="center">${skpl.total_jam.toFixed(1)} jam</td>
                    <td>${skpl.aktivitas || '-'}</td>
                </tr>
                `)
                .join('');
            
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
            flex: 1;
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
            padding-top: 0;
            margin-bottom: 15px;
        }
        .header-section h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            letter-spacing: 0.5px;
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
                <span class="info-value">: ${formatDate(skpl.tanggal)}</span>
            </div>
            <div class="info-row">
                <span class="info-label">LOCATION</span>
                <span class="info-value">: ${skpl.lokasi || 'PSTB'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">KETERANGAN</span>
                <span class="info-value">: ${skpl.keterangan || '-'}</span>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width: 4%;">NO</th>
                    <th style="width: 16%;">NAMA</th>
                    <th style="width: 14%;">NO PEKERJAAN</th>
                    <th style="width: 18%;">JABATAN</th>
                    <th style="width: 16%;">JAM KERJA</th>
                    <th style="width: 14%;">TOTAL JAM KERJA</th>
                    <th style="width: 18%;">KETERANGAN</th>
                </tr>
            </thead>
            <tbody>
                ${karyawanRows}
            </tbody>
        </table>

        <div class="footer-note">
            <strong>*Warna Biru adalah hari libur Nasional/Kerja</strong>
            Jumlah jam lembur<br>
            Kolom Jam bersih, tidak diperkenankan adanya coretan/perubahan.
        </div>

        <div class="signature-section">
            <div class="sig-date">${skpl.lokasi || 'Balikpapan'}, ${formatDate(skpl.tanggal)}</div>
            <div class="sig-title">Shorebase Operation Manager,</div>
            <div style="height: 40px;"></div>
            <div class="sig-name">_____________________</div>
        </div>
    </div>
</body>
</html>
            `;
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(printContent);
                win.document.close();
                // Wait for image to load before printing
                const img = win.document.querySelector('img');
                if (img) {
                    img.onload = () => {
                        setTimeout(() => win.print(), 250);
                    };
                } else {
                    setTimeout(() => win.print(), 250);
                }
            }
        } catch (err) {
            console.error('Failed to load logo for printing:', err);
            alert('Gagal memuat logo untuk print');
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Daftar SKPL</h1>
                    <p className="page-subtitle">Surat Permintaan Kerja Lembur</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/skpl/baru-multi')}>
                    <Plus size={16} /> Buat SKPL Baru
                </button>
            </div>

            {/* Filter */}
            <div className="card mb-4">
                <div className="flex items-center gap-3">
                    <select className="form-select" style={{ width: 160 }} value={filterMonth}
                        onChange={(e) => setFilterMonth(Number(e.target.value))}>
                        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 100 }} value={filterYear}
                        onChange={(e) => setFilterYear(Number(e.target.value))}>
                        {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {filtered.length} SKPL · Total: <strong style={{ color: 'var(--accent-yellow)' }}>{totalJam.toFixed(1)} jam</strong>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Nama Karyawan</th>
                                <th>Jam Lembur</th>
                                <th>Total Jam</th>
                                <th>Aktivitas</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-red)' }}>
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon"><FileText size={40} /></div>
                                            <div className="empty-state-title">Belum ada SKPL bulan ini</div>
                                            <div className="empty-state-desc">Buat SKPL baru untuk mencatat kerja lembur</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((skpl, i) => {
                                    const karyawanNames = (skpl.karyawanList || [])
                                        .map((k) => k.nama)
                                        .join(', ') || '-';
                                    const karyawanCount = (skpl.karyawanList || []).length;
                                    return (
                                        <tr key={skpl.id}>
                                            <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>
                                                {format(new Date(skpl.tanggal), 'dd MMM yyyy', { locale: id })}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                    {karyawanCount > 1
                                                        ? `${karyawanCount} Karyawan`
                                                        : karyawanNames}
                                                </div>
                                                {karyawanCount > 1 && (
                                                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                                        {karyawanNames.substring(0, 50)}{karyawanNames.length > 50 ? '...' : ''}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--accent-yellow)', fontWeight: 600 }}>
                                                {skpl.jam_mulai} – {skpl.jam_selesai}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{skpl.total_jam.toFixed(1)}</span>
                                                <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}> jam</span>
                                            </td>
                                            <td style={{ maxWidth: 200 }}>
                                                <span className="truncate" style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    {skpl.aktivitas}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn-icon" onClick={() => handlePrint(skpl)} data-tooltip="Cetak PDF">
                                                        <Printer size={14} />
                                                    </button>
                                                    <button className="btn-icon" onClick={() => handleDelete(skpl.id)} data-tooltip="Hapus"
                                                        style={{ color: 'var(--accent-red)' }}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
