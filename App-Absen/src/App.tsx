import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import KaryawanPage from './pages/master-data/Karyawan';
import ShiftPage from './pages/master-data/Shift';
import JadwalShiftPage from './pages/master-data/JadwalShift';
import PresensiHarian from './pages/presensi/Harian';
import KalenderPage from './pages/presensi/Kalender';
import DaftarSKPL from './pages/skpl/DaftarSKPL';
import FormSKPLMulti from './pages/skpl/FormSKPLMulti';
import LaporanBulanan from './pages/laporan/Bulanan';
import ExportPage from './pages/laporan/Export';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="master-data">
            <Route index element={<Navigate to="karyawan" replace />} />
            <Route path="karyawan" element={<KaryawanPage />} />
            <Route path="shift" element={<ShiftPage />} />
            <Route path="jadwal-shift" element={<JadwalShiftPage />} />
          </Route>
          <Route path="presensi">
            <Route index element={<Navigate to="harian" replace />} />
            <Route path="harian" element={<PresensiHarian />} />
            <Route path="kalender" element={<KalenderPage />} />
          </Route>
          <Route path="skpl">
            <Route index element={<DaftarSKPL />} />
            <Route path="baru-multi" element={<FormSKPLMulti />} />
          </Route>
          <Route path="laporan">
            <Route index element={<Navigate to="bulanan" replace />} />
            <Route path="bulanan" element={<LaporanBulanan />} />
            <Route path="export" element={<ExportPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
