import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import BedsPage from './pages/BedsPage';
import InvoicesPage from './pages/InvoicesPage';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#388e3c' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
    const { isAuthenticated, hasRole } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (roles && !roles.some(r => hasRole(r))) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastContainer position="top-right" autoClose={3000} />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<DashboardPage />} />
                            <Route path="patients" element={
                                <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'NURSE']}>
                                    <PatientsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="appointments" element={
                                <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE']}>
                                    <AppointmentsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="medical-records" element={
                                <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'NURSE']}>
                                    <MedicalRecordsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="prescriptions" element={
                                <ProtectedRoute roles={['ADMIN', 'DOCTOR']}>
                                    <PrescriptionsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="beds" element={
                                <ProtectedRoute roles={['ADMIN', 'DOCTOR', 'NURSE']}>
                                    <BedsPage />
                                </ProtectedRoute>
                            } />
                            <Route path="invoices" element={
                                <ProtectedRoute roles={['ADMIN', 'PATIENT']}>
                                    <InvoicesPage />
                                </ProtectedRoute>
                            } />
                        </Route>
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
};

export default App;
