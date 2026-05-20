import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
    Button, Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import HotelIcon from '@mui/icons-material/Hotel';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE'] },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { text: 'Appointments', icon: <CalendarMonthIcon />, path: '/appointments', roles: ['ADMIN', 'DOCTOR', 'PATIENT', 'NURSE'] },
    { text: 'Medical Records', icon: <MedicalServicesIcon />, path: '/medical-records', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { text: 'Prescriptions', icon: <MedicationIcon />, path: '/prescriptions', roles: ['ADMIN', 'DOCTOR'] },
    { text: 'Beds', icon: <HotelIcon />, path: '/beds', roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
    { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices', roles: ['ADMIN', 'PATIENT'] },
];

const Layout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Hospital System
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems
                    .filter(item => item.roles.some(r => hasRole(r)))
                    .map((item) => (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
            </List>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        {user?.name} ({user?.role})
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
