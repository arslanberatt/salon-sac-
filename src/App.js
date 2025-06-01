import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';
import { decodeToken } from './utils/decodeToken';
import CalendarPage from './pages/CalendarPage';
import TransactionPage from './pages/TransactionPage';
import CustomerManagerPage from './pages/CustomerManagerPage';
import ServiceManagerPage from './pages/ServiceManagerPage';
import ManageEmployeesPage from './pages/ManageEmployeesPage';
import ProfileEditPage from './pages/ProfileEditPage';
import AdvanceApprovalPage from './pages/AdvanceApprovalPage';
import EmployeeSalaryPage from './pages/EmployeeSalaryPage';

export default function App() {
  const [isPatron, setIsPatron] = useState(false);

  useEffect(() => {
    const decoded = decodeToken();
    setIsPatron(decoded?.role === 'patron'); // sadece patron izinli
  }, []);

  return (
    <BrowserRouter>
      <div className="d-flex">
        {/* Sadece patron ise Sidebar göster */}
        {isPatron && <Sidebar />}

        <div className="flex-grow-1 p-3" style={{ minHeight: '100vh' }}>
          <Routes>
            <Route
              path="/"
              element={
                isPatron ? <Dashboard /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/login"
              element={!isPatron ? <Login /> : <Navigate to="/" replace />}
            />
            <Route
              path="/takvim"
              element={
                isPatron ? <CalendarPage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/kasa"
              element={
                isPatron ? (
                  <TransactionPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/hizmetler"
              element={
                isPatron ? (
                  <ServiceManagerPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/musteriler"
              element={
                isPatron ? (
                  <CustomerManagerPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/calisanlar"
              element={
                isPatron ? (
                  <ManageEmployeesPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profil"
              element={
                isPatron ? (
                  <ProfileEditPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/avans"
              element={
                isPatron ? (
                  <AdvanceApprovalPage />
                ) : (
                  <Navigate to="/avans" replace />
                )
              }
            />
            <Route
              path="/maas"
              element={
                isPatron ? <EmployeeSalaryPage /> : <Navigate to="/maas" replace />
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
