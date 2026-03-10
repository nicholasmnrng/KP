import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const routeLabels: Record<string, { title: string; breadcrumb: string }> = {
    '/': { title: 'Dashboard', breadcrumb: 'Home' },
    '/master-data/karyawan': { title: 'Data Karyawan', breadcrumb: 'Master Data → Karyawan' },
    '/master-data/shift': { title: 'Shift Management', breadcrumb: 'Master Data → Shift' },
    '/master-data/jadwal-shift': { title: 'Jadwal Shift Otomatis', breadcrumb: 'Master Data → Jadwal Shift' },
    '/presensi/harian': { title: 'Presensi Harian', breadcrumb: 'Presensi → Harian' },
    '/presensi/kalender': { title: 'Kalender Individu', breadcrumb: 'Presensi → Kalender' },
    '/skpl': { title: 'Daftar SKPL', breadcrumb: 'SKPL → Daftar' },
    '/skpl/baru-multi': { title: 'Buat SKPL Baru (Multi Karyawan)', breadcrumb: 'SKPL → Buat Baru' },
    '/laporan/bulanan': { title: 'Rekap Bulanan', breadcrumb: 'Laporan → Bulanan' },
    '/laporan/export': { title: 'Export Data', breadcrumb: 'Laporan → Export' },
};

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userName, logout } = useAuthStore();
    
    const info = routeLabels[location.pathname] ?? { title: 'app absen ', breadcrumb: '' };
    const today = format(new Date(), "EEEE, dd MMM yyyy", { locale: id });

    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            logout();
            navigate('/login');
        }
    };

    const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';

    return (
        <header className="header">
            <div className="header-left">
                <span className="header-title">{info.title}</span>
                {info.breadcrumb && (
                    <span className="header-breadcrumb">{info.breadcrumb}</span>
                )}
            </div>
            <div className="header-right">
                <span className="header-date">📅 {today}</span>
                <div className="header-user">
                    <div className="header-avatar">{userInitial}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {userName || 'User'}
                        </span>
                        <button
                            onClick={handleLogout}
                            style={{
                                fontSize: '11px',
                                color: 'var(--accent-red)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'var(--transition)',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-red-light)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-red)';
                            }}
                        >
                            <LogOut size={12} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
