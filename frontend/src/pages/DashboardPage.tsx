import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HotelIcon from '@mui/icons-material/Hotel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAuth } from '../contexts/AuthContext';
import { bedService } from '../services/bedService';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary">{title}</Typography>
                </Box>
                <Box sx={{ color, opacity: 0.7 }}>{icon}</Box>
            </Box>
        </CardContent>
    </Card>
);

const DashboardPage: React.FC = () => {
    const { user, hasRole } = useAuth();
    const [bedStats, setBedStats] = useState({ available: 0, occupied: 0 });

    useEffect(() => {
        if (hasRole('ADMIN') || hasRole('DOCTOR') || hasRole('NURSE')) {
            bedService.getStats().then(res => setBedStats(res.data)).catch(() => {});
        }
    }, [hasRole]);

    const doctorMenu = [
        { title: 'Today Appointments', value: '8', icon: <CalendarMonthIcon sx={{ fontSize: 48 }} />, color: '#1976d2' },
        { title: 'Active Patients', value: '156', icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#388e3c' },
        { title: 'Available Beds', value: bedStats.available, icon: <HotelIcon sx={{ fontSize: 48 }} />, color: '#f57c00' },
        { title: 'Pending Prescriptions', value: '12', icon: <ReceiptIcon sx={{ fontSize: 48 }} />, color: '#d32f2f' },
    ];

    const patientMenu = [
        { title: 'Upcoming Appointments', value: '2', icon: <CalendarMonthIcon sx={{ fontSize: 48 }} />, color: '#1976d2' },
        { title: 'Medical Records', value: '5', icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#388e3c' },
        { title: 'Pending Invoices', value: '1', icon: <ReceiptIcon sx={{ fontSize: 48 }} />, color: '#d32f2f' },
    ];

    const adminMenu = [
        { title: 'Total Patients', value: '1,234', icon: <PeopleIcon sx={{ fontSize: 48 }} />, color: '#1976d2' },
        { title: 'Today Appointments', value: '42', icon: <CalendarMonthIcon sx={{ fontSize: 48 }} />, color: '#388e3c' },
        { title: 'Available Beds', value: bedStats.available, icon: <HotelIcon sx={{ fontSize: 48 }} />, color: '#f57c00' },
        { title: 'Revenue Today', value: 'R$ 12.450', icon: <ReceiptIcon sx={{ fontSize: 48 }} />, color: '#d32f2f' },
    ];

    const items = hasRole('PATIENT') ? patientMenu : hasRole('ADMIN') ? adminMenu : doctorMenu;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Welcome, {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {hasRole('DOCTOR') && 'Manage your patients, appointments, and prescriptions'}
                {hasRole('PATIENT') && 'View your appointments, medical records, and invoices'}
                {hasRole('ADMIN') && 'Oversee all hospital operations'}
                {hasRole('NURSE') && 'Manage beds and patient care'}
            </Typography>
            <Grid container spacing={3}>
                {items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatCard {...item} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardPage;
