import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useInitStores } from '../../hooks/useInitStores';

export default function Layout() {
    // Initialize data stores when user is logged in
    useInitStores();

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
