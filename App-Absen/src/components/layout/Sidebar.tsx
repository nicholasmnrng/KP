import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Clock,
    ClipboardList,
    Calendar,
    FileText,
    PlusCircle,
    BarChart3,
    Download,
    ChevronRight,
    Droplets,
} from 'lucide-react';

interface NavGroupProps {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    matchPaths?: string[];
}

function NavGroup({ icon, label, children, defaultOpen = false, matchPaths = [] }: NavGroupProps) {
    const location = useLocation();
    const isActive = matchPaths.some((p) => location.pathname.startsWith(p));
    const [open, setOpen] = useState(defaultOpen || isActive);

    return (
        <div className="nav-group">
            <div
                className={`nav-group-header ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
                <ChevronRight size={14} className={`nav-chevron ${open ? 'open' : ''}`} />
            </div>
            {open && <div className="nav-group-children">{children}</div>}
        </div>
    );
}

export default function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Droplets size={20} color="white" />
                </div>
                <div className="sidebar-logo-text">
                    <span className="sidebar-logo-title">IPMS SHOREBASE</span>
                    <span className="sidebar-logo-sub">PTK SHOREBASE TANJUNG BATU</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={18} className="nav-icon" />
                    Dashboard
                </NavLink>

                <span className="nav-section-label">Master Data</span>

                <NavGroup
                    icon={<Users size={18} />}
                    label="Master Data"
                    matchPaths={['/master-data']}
                >
                    <NavLink
                        to="/master-data/karyawan"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Users size={16} className="nav-icon" />
                        Data Karyawan
                    </NavLink>
                    <NavLink
                        to="/master-data/shift"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Clock size={16} className="nav-icon" />
                        Shift Management
                    </NavLink>
                    <NavLink
                        to="/master-data/jadwal-shift"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Calendar size={16} className="nav-icon" />
                        Jadwal Shift Otomatis
                    </NavLink>
                </NavGroup>

                <span className="nav-section-label">Operasional</span>

                <NavGroup
                    icon={<ClipboardList size={18} />}
                    label="Presensi"
                    matchPaths={['/presensi']}
                >
                    <NavLink
                        to="/presensi/harian"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <ClipboardList size={16} className="nav-icon" />
                        Presensi Harian
                    </NavLink>
                    <NavLink
                        to="/presensi/kalender"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Calendar size={16} className="nav-icon" />
                        Kalender Individu
                    </NavLink>
                </NavGroup>

                <NavGroup
                    icon={<FileText size={18} />}
                    label="SKPL"
                    matchPaths={['/skpl']}
                >
                    <NavLink
                        to="/skpl"
                        end
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <FileText size={16} className="nav-icon" />
                        Daftar SKPL
                    </NavLink>
                    <NavLink
                        to="/skpl/baru-multi"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <PlusCircle size={16} className="nav-icon" />
                        Buat SKPL Baru
                    </NavLink>
                </NavGroup>

                <span className="nav-section-label">Laporan</span>

                <NavGroup
                    icon={<BarChart3 size={18} />}
                    label="Laporan"
                    matchPaths={['/laporan']}
                >
                    <NavLink
                        to="/laporan/bulanan"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <BarChart3 size={16} className="nav-icon" />
                        Rekap Bulanan
                    </NavLink>
                    <NavLink
                        to="/laporan/export"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Download size={16} className="nav-icon" />
                        Export Data
                    </NavLink>
                </NavGroup>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
                    <div>v1.0.0 · made by</div>
                    <div style={{ fontSize: '10px', marginTop: '4px' }}>
                        Nicholas Manurung - Frontend
                    </div>
                    <div style={{ fontSize: '10px' }}>
                        Adam Ibnu Ramadhan - Backend
                    </div>
                </div>
            </div>
        </aside>
    );
}
