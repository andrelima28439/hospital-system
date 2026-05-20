import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, IconButton, MenuItem, TablePagination,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { patientService, PatientData } from '../services/patientService';

const initialForm: PatientData = {
    name: '', cpf: '', email: '', phone: '', address: '',
    birthDate: '', gender: '', bloodType: '', allergies: '',
    medicalConditions: '', insuranceProvider: '', insuranceNumber: '',
};

const PatientsPage: React.FC = () => {
    const [patients, setPatients] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);
    const [form, setForm] = useState<PatientData>(initialForm);

    const loadPatients = () => {
        patientService.findAll({ page, size: rowsPerPage, sort: 'id,desc' })
            .then(res => { setPatients(res.data.content); setTotal(res.data.totalElements); })
            .catch(() => {});
    };

    useEffect(() => { loadPatients(); }, [page, rowsPerPage]);

    const handleSave = async () => {
        try {
            if (editing) {
                await patientService.update(editing, form);
            } else {
                await patientService.create(form);
            }
            setDialogOpen(false);
            setForm(initialForm);
            setEditing(null);
            loadPatients();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (p: any) => {
        setForm(p);
        setEditing(p.id);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Deactivate this patient?')) {
            await patientService.deactivate(id);
            loadPatients();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Patients</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => { setForm(initialForm); setEditing(null); setDialogOpen(true); }}>
                    New Patient
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Blood Type</TableCell>
                            <TableCell>Insurance</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {patients.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.cpf}</TableCell>
                                <TableCell>{p.email}</TableCell>
                                <TableCell>{p.phone}</TableCell>
                                <TableCell>{p.bloodType}</TableCell>
                                <TableCell>{p.insuranceProvider}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(p)}><Edit /></IconButton>
                                    <IconButton onClick={() => handleDelete(p.id)}><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editing ? 'Edit Patient' : 'New Patient'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                        <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <TextField label="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} sx={{ gridColumn: 'span 2' }} />
                        <TextField label="Birth Date" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        <TextField label="Gender" select value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                            {['Male', 'Female', 'Other'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                        <TextField label="Blood Type" select value={form.bloodType || ''} onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </TextField>
                        <TextField label="Allergies" multiline rows={2} value={form.allergies || ''} onChange={(e) => setForm({ ...form, allergies: e.target.value })} sx={{ gridColumn: 'span 2' }} />
                        <TextField label="Medical Conditions" multiline rows={2} value={form.medicalConditions || ''} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} sx={{ gridColumn: 'span 2' }} />
                        <TextField label="Insurance Provider" value={form.insuranceProvider || ''} onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })} />
                        <TextField label="Insurance Number" value={form.insuranceNumber || ''} onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PatientsPage;
