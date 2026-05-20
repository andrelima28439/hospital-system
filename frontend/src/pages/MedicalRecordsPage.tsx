import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, Paper, List, ListItem, ListItemText, Card, CardContent, Grid, Divider,
    Autocomplete,
} from '@mui/material';
import { medicalRecordService } from '../services/medicalRecordService';
import { patientService, PatientData } from '../services/patientService';

const MedicalRecordsPage: React.FC = () => {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ symptoms: '', diagnosis: '', treatment: '', notes: '' });

    useEffect(() => {
        patientService.findAll({ page: 0, size: 100 })
            .then(res => setPatients(res.data.content))
            .catch(() => {});
    }, []);

    const loadRecords = (patientId: number) => {
        medicalRecordService.getPatientHistory(patientId)
            .then(res => setRecords(res.data))
            .catch(() => {});
    };

    const handleSelectPatient = (patient: PatientData | null) => {
        setSelectedPatient(patient);
        if (patient?.id) loadRecords(patient.id);
    };

    const handleCreate = async () => {
        if (!selectedPatient?.id) return;
        try {
            await medicalRecordService.create({
                patientId: selectedPatient.id,
                ...form,
            });
            setDialogOpen(false);
            setForm({ symptoms: '', diagnosis: '', treatment: '', notes: '' });
            loadRecords(selectedPatient.id);
        } catch (err) { console.error(err); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Medical Records</Typography>
                <Button variant="contained" disabled={!selectedPatient} onClick={() => setDialogOpen(true)}>
                    New Record
                </Button>
            </Box>

            <Autocomplete
                options={patients}
                getOptionLabel={(p) => `${p.name} - ${p.cpf || ''}`}
                onChange={(_, v) => handleSelectPatient(v)}
                renderInput={(params) => <TextField {...params} label="Search Patient" />}
                sx={{ mb: 3 }}
            />

            {records.length === 0 && selectedPatient && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No medical records found for this patient</Typography>
                </Paper>
            )}

            <List>
                {records.map((record) => (
                    <Card key={record.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="primary">
                                        Dr. {record.doctor?.name} - {new Date(record.recordDate).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                                <Divider />
                                {record.symptoms && (
                                    <Grid item xs={12}><Typography variant="body2"><strong>Symptoms:</strong> {record.symptoms}</Typography></Grid>
                                )}
                                {record.diagnosis && (
                                    <Grid item xs={12}><Typography variant="body2"><strong>Diagnosis:</strong> {record.diagnosis}</Typography></Grid>
                                )}
                                {record.treatment && (
                                    <Grid item xs={12}><Typography variant="body2"><strong>Treatment:</strong> {record.treatment}</Typography></Grid>
                                )}
                                {record.notes && (
                                    <Grid item xs={12}><Typography variant="body2"><strong>Notes:</strong> {record.notes}</Typography></Grid>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                ))}
            </List>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>New Medical Record - {selectedPatient?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField label="Symptoms" multiline rows={3} fullWidth value={form.symptoms}
                                onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Diagnosis" multiline rows={3} fullWidth value={form.diagnosis}
                                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Treatment" multiline rows={3} fullWidth value={form.treatment}
                                onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Additional Notes" multiline rows={3} fullWidth value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MedicalRecordsPage;
