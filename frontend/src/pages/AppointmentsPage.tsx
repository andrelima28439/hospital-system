import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, Paper, MenuItem, Grid, Chip,
} from '@mui/material';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const statusColors: Record<string, string> = {
    SCHEDULED: 'info', CONFIRMED: 'success', IN_PROGRESS: 'warning',
    COMPLETED: 'default', CANCELLED: 'error', NO_SHOW: 'error',
};

const AppointmentsPage: React.FC = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ patientId: '', doctorId: 1, dateTime: '', reason: '', notes: '' });

    useEffect(() => {
        patientService.findAll({ page: 0, size: 100 })
            .then(res => setPatients(res.data.content))
            .catch(() => {});
        loadEvents();
    }, []);

    const loadEvents = () => {
        appointmentService.findByDoctor(1, { page: 0, size: 100 })
            .then(res => {
                const evts = res.data.content.map((a: any) => ({
                    id: a.id,
                    title: `${a.patient?.name} - ${a.status}`,
                    start: new Date(a.dateTime),
                    end: new Date(a.endDateTime),
                    status: a.status,
                }));
                setEvents(evts);
            })
            .catch(() => {});
    };

    const handleCreate = async () => {
        try {
            await appointmentService.create({
                patientId: parseInt(form.patientId),
                doctorId: form.doctorId,
                dateTime: new Date(form.dateTime).toISOString(),
                reason: form.reason,
                notes: form.notes,
            });
            setDialogOpen(false);
            setForm({ patientId: '', doctorId: 1, dateTime: '', reason: '', notes: '' });
            loadEvents();
        } catch (err) { console.error(err); }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Appointments</Typography>
                <Button variant="contained" onClick={() => setDialogOpen(true)}>New Appointment</Button>
            </Box>

            <Paper sx={{ p: 2, height: 600 }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView={Views.MONTH}
                    views={['month', 'week', 'day']}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor: event.status === 'CANCELLED' ? '#ef5350' : '#1976d2',
                            borderRadius: '4px',
                            fontSize: '0.85em',
                        },
                    })}
                />
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Schedule Appointment</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField select label="Patient" fullWidth required value={form.patientId}
                                onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                                {patients.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name} - {p.cpf}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Date & Time" type="datetime-local" fullWidth required
                                value={form.dateTime}
                                onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Reason" fullWidth value={form.reason}
                                onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" multiline rows={3} fullWidth value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Schedule</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppointmentsPage;
