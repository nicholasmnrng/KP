import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Search, Printer, ArrowLeft } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import { useSKPLStore } from '../../store/skplStore';

function calcTotalJam(mulai: string, selesai: string): number {
    const [hm, mm] = mulai.split(':').map(Number);
    const [hs, ms] = selesai.split(':').map(Number);
    let diff = (hs * 60 + ms) - (hm * 60 + mm);
    if (diff < 0) diff += 24 * 60;
    return Math.round(diff / 60 * 10) / 10;
}

export default function FormSKPL() {
    const navigate = useNavigate();
    const { karyawanList } = useKaryawanStore();
    const { addSKPL, loading: skplLoading } = useSKPLStore();

    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [tanggal, setTanggal] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [jam_mulai, setJamMulai] = useState('17:00');
    const [jam_selesai, setJamSelesai] = useState('21:00');
    const [aktivitas, setAktivitas] = useState('');
    const [lokasi, setLokasi] = useState('PSTB');
    const [keterangan, setKeterangan] = useState('');
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const karyawan = karyawanList.find((k) => k.id === selectedId);
    const totalJam = useMemo(() => calcTotalJam(jam_mulai, jam_selesai), [jam_mulai, jam_selesai]);

    const filteredKaryawan = karyawanList.filter(
        (k) => k.status_aktif && (k.nama.toLowerCase().includes(search.toLowerCase()) || k.nik.includes(search))
    );

    const handleSelectKaryawan = (k: typeof karyawanList[0]) => {
        setSelectedId(k.id);
        setSearch(k.nama);
        setShowDropdown(false);
    };

    const handleSave = async (andPrint = false) => {
        if (!selectedId || !tanggal || !aktivitas) {
            setSaveError('Silakan isi semua field yang diperlukan');
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
                idKaryawanList: [selectedId]
            });
            setSaved(true);
            
            if (andPrint) {
                try {
                    // Fetch logo and convert to data URL
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
                        const monthIdx = d.getMonth();
                        const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                        const year = d.getFullYear();
                        return `${day} ${MONTHS[monthIdx]} ${year}`;
                    };

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
                <tr>
                    <td class="center">1</td>
                    <td>${karyawan?.nama || '-'}</td>
                    <td>${karyawan?.nik || '-'}</td>
                    <td>${karyawan?.jabatan || '-'}</td>
                    <td class="center">${jam_mulai.substring(0,5)}<br>${jam_selesai.substring(0,5)}</td>
                    <td class="center">${totalJam.toFixed(1)} jam</td>
                    <td>${aktivitas || '-'}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer-note">
            <strong>*Warna Biru adalah hari libur Nasional/Kerja</strong>
            Jumlah jam lembur<br>
            Kolom Jam bersih, tidak diperkenankan adanya coretan/perubahan.
        </div>

        <div class="signature-section">
            <div class="sig-date">${lokasi || 'Balikpapan'}, ${formatDate(tanggal)}</div>
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
                }
            }
            setTimeout(() => navigate('/skpl'), 1000);
        } catch (err) {
            setSaveError((err as Error).message);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Buat SKPL Baru</h1>
                    <p className="page-subtitle">Surat Permintaan Kerja Lembur</p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/skpl')}>
                    <ArrowLeft size={16} /> Kembali
                </button>
            </div>

            {saved && (
                <div className="alert alert-success mb-4">✅ SKPL berhasil disimpan!</div>
            )}

            {saveError && (
                <div style={{ 
                    padding: '12px 16px', 
                    marginBottom: '16px', 
                    backgroundColor: 'var(--accent-red-dim)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--accent-red)',
                    fontSize: '13px'
                }}>
                    ⚠️ {saveError}
                </div>
            )}

            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Nama Karyawan - Autocomplete */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Nama Karyawan *</label>
                        <div className="search-bar">
                            <Search size={16} className="search-icon" />
                            <input
                                className="form-input"
                                placeholder="Ketik nama karyawan..."
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setSelectedId(''); setShowDropdown(true); }}
                                onFocus={() => setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                            />
                        </div>
                        {showDropdown && filteredKaryawan.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                                maxHeight: 200, overflowY: 'auto', marginTop: 4
                            }}>
                                {filteredKaryawan.map((k) => (
                                    <div key={k.id}
                                        onMouseDown={() => handleSelectKaryawan(k)}
                                        style={{
                                            padding: '10px 14px', cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.1s'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{k.nama}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{k.nik} · {k.jabatan}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auto-fill info */}
                    {karyawan && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">NIK</label>
                                <input className="form-input" value={karyawan.nik} readOnly style={{ opacity: 0.7 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jabatan</label>
                                <input className="form-input" value={karyawan.jabatan} readOnly style={{ opacity: 0.7 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Departemen</label>
                                <input className="form-input" value={karyawan.departemen} readOnly style={{ opacity: 0.7 }} />
                            </div>
                        </div>
                    )}

                    <div className="divider" />

                    {/* Tanggal & Jam */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tanggal Lembur *</label>
                            <input type="date" className="form-input" value={tanggal}
                                onChange={(e) => setTanggal(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Jam Mulai *</label>
                            <input type="time" className="form-input" value={jam_mulai}
                                onChange={(e) => setJamMulai(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Jam Selesai *</label>
                            <input type="time" className="form-input" value={jam_selesai}
                                onChange={(e) => setJamSelesai(e.target.value)} />
                        </div>
                    </div>

                    {/* Auto-calc */}
                    <div style={{
                        padding: '16px 20px', borderRadius: 'var(--radius-md)',
                        background: 'var(--accent-yellow-dim)', border: '1px solid rgba(245,158,11,0.25)',
                        display: 'flex', alignItems: 'center', gap: '12px'
                    }}>
                        <span style={{ fontSize: '24px' }}>⚡</span>
                        <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Total Jam Lembur (Auto-Calc)</div>
                            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-yellow)' }}>
                                {totalJam.toFixed(1)} <span style={{ fontSize: '16px', fontWeight: 400 }}>jam</span>
                            </div>
                        </div>
                    </div>

                    {/* Aktivitas */}
                    <div className="form-group">
                        <label className="form-label">Aktivitas / Pekerjaan Lembur *</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Deskripsikan pekerjaan yang dilakukan saat lembur..."
                            value={aktivitas}
                            onChange={(e) => setAktivitas(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Lokasi & Keterangan */}
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Lokasi</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Contoh: PSTB, Kantor Pusat, dll"
                                value={lokasi}
                                onChange={(e) => setLokasi(e.target.value)} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Keterangan</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Contoh: Lembur Operator Day Shift"
                                value={keterangan}
                                onChange={(e) => setKeterangan(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div className="divider" />

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/skpl')} disabled={skplLoading}>
                            Batal
                        </button>
                        <button
                            className="btn btn-success btn-lg"
                            onClick={() => handleSave(false)}
                            disabled={!selectedId || !aktivitas || skplLoading}
                        >
                            {skplLoading ? '⏳ Menyimpan...' : '💾 Simpan Draft'}
                        </button>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => handleSave(true)}
                            disabled={!selectedId || !aktivitas || skplLoading}
                        >
                            {skplLoading ? '⏳ Menyimpan...' : <><Printer size={16} /> Simpan & Cetak PDF</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
