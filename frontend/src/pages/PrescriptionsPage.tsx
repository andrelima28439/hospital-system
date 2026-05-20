import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, Paper, List, ListItem, ListItemText, IconButton, Grid, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Add, Delete, PictureAsPdf } from '@mui/icons-material';
import { prescriptionService, PrescriptionItemData } from '../services/prescriptionService';
import { patientService, PatientData } from '../services/patientService';

const PrescriptionsPage: React.FC = () => {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ notes: '', validUntil: '' });
    const [items, setItems] = useState<PrescriptionItemData[]>([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

    useEffect(() => {
        patientService.findAll({ page: 0, size: 100 })
            .then(res => setPatients(res.data.content))
            .catch(() => {});
    }, []);

    const loadPrescriptions = (patientId: number) => {
        prescriptionService.getPatientPrescriptions(patientId)
            .then(res => setPrescriptions(res.data))
            .catch(() => {});
    };

    const handleSelectPatient = (patient: PatientData | null) => {
        setSelectedPatient(patient);
        if (patient?.id) loadPrescriptions(patient.id);
    };

    const handleAddItem = () => {
        setItems([...items, { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleCreate = async () => {
        if (!selectedPatient?.id) return;
        try {
            await prescriptionService.create({
                patientId: selectedPatient.id,
                notes: form.notes,
                validUntil: form.validUntil || undefined,
                items,
            });
            setDialogOpen(false);
            setForm({ notes: '', validUntil: '' });
            setItems([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            loadPrescriptions(selectedPatient.id);
        } catch (err) { console.error(err); }
    };

    const handleDownloadPdf = async (id: number) => {
        try {
            const res = await prescriptionService.generatePdf(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `prescription-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) { console.error(err); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Prescriptions</Typography>
                <Button variant="contained" disabled={!selectedPatient} startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    New Prescription
                </Button>
            </Box>

            <Autocomplete
                options={patients}
                getOptionLabel={(p) => `${p.name} - ${p.cpf || ''}`}
                onChange={(_, v) => handleSelectPatient(v)}
                renderInput={(params) => <TextField {...params} label="Search Patient" />}
                sx={{ mb: 3 }}
            />

            {prescriptions.length === 0 && selectedPatient && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No prescriptions found for this patient</Typography>
                </Paper>
            )}

            <List>
                {prescriptions.map((prescription) => (
                    <Paper key={prescription.id} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    Prescription - {new Date(prescription.issueDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Dr. {prescription.doctor?.name}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => handleDownloadPdf(prescription.id)} color="primary">
                                <PictureAsPdf />
                            </IconButton>
                        </Box>
                        {prescription.items?.map((item: any, idx: number) => (
                            <Box key={idx} sx={{ ml: 2, mt: 1 }}>
                                <Typography variant="body2">
                                    {item.medicationName} - {item.dosage} - {item.frequency} - {item.duration}
                                </Typography>
                            </Box>
                        ))}
                        {prescription.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Notes: {prescription.notes}
                            </Typography>
                        )}
                    </Paper>
                ))}
            </List>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>New Prescription - {selectedPatient?.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField label="Issue Date" type="date" fullWidth value={new Date().toISOString().split('T')[0]}
                                InputLabelProps={{ shrink: true }} disabled />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Valid Until" type="date" fullWidth value={form.validUntil}
                                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" multiline rows={2} fullWidth value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Medications</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Medication</TableCell>
                                            <TableCell>Dosage</TableCell>
                                            <TableCell>Frequency</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Instructions</TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <TextField size="small" value={item.medicationName}
                                                        onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" value={item.dosage}
                                                        onChange={(e) => handleItemChange(index, 'dosage', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" value={item.frequency}
                                                        onChange={(e) => handleItemChange(index, 'frequency', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" value={item.duration}
                                                        onChange={(e) => handleItemChange(index, 'duration', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" value={item.instructions}
                                                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)} />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleRemoveItem(index)}><Delete /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mt: 1 }}>Add Medication</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create Prescription</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PrescriptionsPage;
