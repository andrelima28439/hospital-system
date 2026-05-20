import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Card, CardContent, TextField, Button, Typography, Alert,
    ToggleButtonGroup, ToggleButton, Container,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [role, setRole] = useState('PATIENT');
    const [form, setForm] = useState({ email: '', password: '', name: '', phone: '', cpf: '', specialty: '', crm: '' });
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                await register({ ...form, role });
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
                        Hospital System
                    </Typography>

                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={(_, v) => v && setMode(v)}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <ToggleButton value="login">Login</ToggleButton>
                        <ToggleButton value="register">Register</ToggleButton>
                    </ToggleButtonGroup>

                    {mode === 'register' && (
                        <ToggleButtonGroup
                            value={role}
                            exclusive
                            onChange={(_, v) => v && setRole(v)}
                            fullWidth
                            sx={{ mb: 2 }}
                            size="small"
                        >
                            <ToggleButton value="PATIENT">Patient</ToggleButton>
                            <ToggleButton value="DOCTOR">Doctor</ToggleButton>
                            <ToggleButton value="ADMIN">Admin</ToggleButton>
                        </ToggleButtonGroup>
                    )}

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <TextField
                                fullWidth label="Name" margin="normal" required
                                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        )}
                        <TextField
                            fullWidth label="Email" type="email" margin="normal" required
                            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <TextField
                            fullWidth label="Password" type="password" margin="normal" required
                            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        {mode === 'register' && (
                            <>
                                <TextField fullWidth label="Phone" margin="normal" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                <TextField fullWidth label="CPF" margin="normal" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                                {role === 'DOCTOR' && (
                                    <>
                                        <TextField fullWidth label="Specialty" margin="normal" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
                                        <TextField fullWidth label="CRM" margin="normal" required value={form.crm} onChange={(e) => setForm({ ...form, crm: e.target.value })} />
                                    </>
                                )}
                            </>
                        )}
                        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }}>
                            {mode === 'login' ? 'Login' : 'Register'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default LoginPage;
