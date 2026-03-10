import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useKaryawanStore } from '../../store/karyawanStore';
import type { Karyawan } from '../../types';

const emptyForm: Omit<Karyawan, 'id' | 'created_at' | 'updated_at'> = {
    nik: '', nama: '', jabatan: '', departemen: '', no_hp: '', status_aktif: true,
};

export default function KaryawanPage() {
    const { karyawanList, loading, error, addKaryawan, updateKaryawan, deleteKaryawan } = useKaryawanStore();
    
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'semua' | 'aktif' | 'nonaktif'>('semua');
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<Omit<Karyawan, 'id' | 'created_at' | 'updated_at'>>(emptyForm);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const filtered = karyawanList.filter((k) => {
        const matchSearch =
            k.nama.toLowerCase().includes(search.toLowerCase()) ||
            k.nik.includes(search);
        const matchStatus =
            filterStatus === 'semua' ||
            (filterStatus === 'aktif' && k.status_aktif) ||
            (filterStatus === 'nonaktif' && !k.status_aktif);
        return matchSearch && matchStatus;
    });

    const openAdd = () => {
        setEditId(null);
        setForm(emptyForm);
        setSaveError(null);
        setShowModal(true);
    };

    const openEdit = (k: Karyawan) => {
        setEditId(k.id);
        setForm({ nik: k.nik, nama: k.nama, jabatan: k.jabatan, departemen: k.departemen, no_hp: k.no_hp, status_aktif: k.status_aktif });
        setSaveError(null);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.nik || !form.nama) {
            setSaveError('NIK dan Nama harus diisi');
            return;
        }
        
        setSaveLoading(true);
        setSaveError(null);
        try {
            if (editId) {
                await updateKaryawan(editId, form);
            } else {
                await addKaryawan(form);
            }
            setShowModal(false);
        } catch (err) {
            setSaveError((err as Error).message);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Hapus karyawan ini? Tindakan ini tidak dapat dibatalkan.')) {
            try {
                await deleteKaryawan(id);
            } catch (err) {
                alert('Gagal menghapus: ' + (err as Error).message);
            }
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Data Karyawan</h1>
                    <p className="page-subtitle">{karyawanList.length} total karyawan terdaftar</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd} disabled={loading}>
                    <Plus size={16} /> Tambah Karyawan
                </button>
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

            {/* Filters */}
            <div className="card mb-4">
                <div className="flex items-center gap-3">
                    <div className="search-bar" style={{ flex: 1 }}>
                        <Search size={16} className="search-icon" />
                        <input
                            className="form-input"
                            placeholder="Cari nama atau NIK..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        style={{ width: 160 }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    >
                        <option value="semua">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-aktif</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>NIK</th>
                                <th>Nama</th>
                                <th>Jabatan</th>
                                <th>Departemen</th>
                                <th>No. HP</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">👥</div>
                                            <div className="empty-state-title">Belum ada karyawan</div>
                                            <div className="empty-state-desc">Klik "Tambah Karyawan" untuk menambahkan data</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((k, i) => (
                                    <tr key={k.id}>
                                        <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-blue-light)' }}>{k.nik}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{k.nama}</td>
                                        <td>{k.jabatan}</td>
                                        <td>{k.departemen}</td>
                                        <td>{k.no_hp || '-'}</td>
                                        <td>
                                            <span className={`badge ${k.status_aktif ? 'badge-aktif' : 'badge-nonaktif'}`}>
                                                {k.status_aktif ? 'Aktif' : 'Non-aktif'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button className="btn-icon" onClick={() => openEdit(k)} data-tooltip="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="btn-icon" onClick={() => handleDelete(k.id)} data-tooltip="Hapus"
                                                    style={{ color: 'var(--accent-red)' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <span className="modal-title">{editId ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</span>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            {saveError && (
                                <div style={{ 
                                    padding: '12px', 
                                    marginBottom: '12px',
                                    backgroundColor: '#fee', 
                                    border: '1px solid #fcc', 
                                    borderRadius: '4px',
                                    color: '#c33',
                                    fontSize: '14px'
                                }}>
                                    ⚠️ {saveError}
                                </div>
                            )}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">NIK *</label>
                                    <input className="form-input" placeholder="Nomor Induk Karyawan" value={form.nik}
                                        onChange={(e) => setForm({ ...form, nik: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap *</label>
                                    <input className="form-input" placeholder="Nama karyawan" value={form.nama}
                                        onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Jabatan</label>
                                    <input className="form-input" placeholder="Jabatan/Posisi" value={form.jabatan}
                                        onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Departemen / Vendor</label>
                                    <input className="form-input" placeholder="Departemen atau nama vendor" value={form.departemen}
                                        onChange={(e) => setForm({ ...form, departemen: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">No. HP</label>
                                    <input className="form-input" placeholder="08xx-xxxx-xxxx" value={form.no_hp}
                                        onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <select className="form-select" value={form.status_aktif ? 'aktif' : 'nonaktif'}
                                        onChange={(e) => setForm({ ...form, status_aktif: e.target.value === 'aktif' })}>
                                        <option value="aktif">Aktif</option>
                                        <option value="nonaktif">Non-aktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saveLoading}>Batal</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={!form.nik || !form.nama || saveLoading}>
                                {saveLoading ? '⏳ Menyimpan...' : '💾 Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
