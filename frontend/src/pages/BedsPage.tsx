import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, Paper, Grid, Chip, MenuItem, Card, CardContent,
} from '@mui/material';
import { bedService } from '../services/bedService';
import { patientService, PatientData } from '../services/patientService';

const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
    AVAILABLE: 'success', OCCUPIED: 'error', RESERVED: 'warning',
    MAINTENANCE: 'info', CLEANING: 'default',
};

const BedsPage: React.FC = () => {
    const [beds, setBeds] = useState<any[]>([]);
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [occupyDialog, setOccupyDialog] = useState(false);
    const [selectedBed, setSelectedBed] = useState<any>(null);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [form, setForm] = useState({ bedNumber: '', ward: '', room: '', status: 'AVAILABLE' });

    useEffect(() => {
        loadBeds();
        patientService.findAll({ page: 0, size: 100 })
            .then(res => setPatients(res.data.content))
            .catch(() => {});
    }, []);

    const loadBeds = () => {
        bedService.findAll().then(res => setBeds(res.data)).catch(() => {});
    };

    const handleCreate = async () => {
        try {
            await bedService.create(form);
            setDialogOpen(false);
            setForm({ bedNumber: '', ward: '', room: '', status: 'AVAILABLE' });
            loadBeds();
        } catch (err) { console.error(err); }
    };

    const handleOccupy = async () => {
        if (!selectedBed || !selectedPatientId) return;
        try {
            await bedService.occupy(selectedBed.id, parseInt(selectedPatientId));
            setOccupyDialog(false);
            setSelectedBed(null);
            setSelectedPatientId('');
            loadBeds();
        } catch (err) { console.error(err); }
    };

    const handleRelease = async (bedId: number) => {
        if (window.confirm('Release this bed?')) {
            await bedService.release(bedId);
            loadBeds();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Bed Management</Typography>
                <Button variant="contained" onClick={() => setDialogOpen(true)}>Add Bed</Button>
            </Box>

            <Grid container spacing={2}>
                {beds.map((bed) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={bed.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Bed {bed.bedNumber}</Typography>
                                    <Chip label={bed.status} color={statusColors[bed.status] || 'default'} size="small" />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Ward: {bed.ward} | Room: {bed.room || '-'}
                                </Typography>
                                {bed.patient && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Patient: {bed.patient.name}
                                    </Typography>
                                )}
                                <Box sx={{ mt: 1 }}>
                                    {bed.status === 'AVAILABLE' && (
                                        <Button size="small" variant="outlined" onClick={() => { setSelectedBed(bed); setOccupyDialog(true); }}>
                                            Occupy
                                        </Button>
                                    )}
                                    {bed.status === 'OCCUPIED' && (
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleRelease(bed.id)}>
                                            Release
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Bed</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField label="Bed Number" fullWidth required value={form.bedNumber}
                                onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Ward" fullWidth required value={form.ward}
                                onChange={(e) => setForm({ ...form, ward: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Room" fullWidth value={form.room}
                                onChange={(e) => setForm({ ...form, room: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Status" fullWidth value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                <MenuItem value="AVAILABLE">Available</MenuItem>
                                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                                <MenuItem value="CLEANING">Cleaning</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={occupyDialog} onClose={() => setOccupyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Occupy Bed {selectedBed?.bedNumber}</DialogTitle>
                <DialogContent>
                    <TextField select label="Select Patient" fullWidth value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)} sx={{ mt: 2 }}>
                        {patients.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.name} - {p.cpf}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOccupyDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleOccupy}>Occupy</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BedsPage;
