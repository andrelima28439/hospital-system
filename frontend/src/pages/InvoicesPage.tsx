import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, MenuItem, Grid, IconButton,
} from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { invoiceService } from '../services/invoiceService';
import { patientService, PatientData } from '../services/patientService';

const statusColors: Record<string, 'warning' | 'success' | 'info' | 'error' | 'default'> = {
    PENDING: 'warning', PAID: 'success', PARTIALLY_PAID: 'info', OVERDUE: 'error', CANCELLED: 'default', REFUNDED: 'default',
};

const InvoicesPage: React.FC = () => {
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailDialog, setDetailDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [form, setForm] = useState({ dueDate: '', discount: 0, paymentMethod: 'CREDIT_CARD', notes: '' });
    const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);

    useEffect(() => {
        patientService.findAll({ page: 0, size: 100 })
            .then(res => setPatients(res.data.content))
            .catch(() => {});
    }, []);

    const loadInvoices = (patientId: number) => {
        invoiceService.findByPatient(patientId, { page: 0, size: 100 })
            .then(res => setInvoices(res.data.content))
            .catch(() => {});
    };

    const handleSelectPatient = (id: string) => {
        setSelectedPatientId(id);
        if (id) loadInvoices(parseInt(id));
    };

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleCreate = async () => {
        if (!selectedPatientId) return;
        try {
            await invoiceService.create({
                patientId: parseInt(selectedPatientId),
                dueDate: form.dueDate || undefined,
                discount: form.discount,
                paymentMethod: form.paymentMethod,
                notes: form.notes,
                items,
            });
            setDialogOpen(false);
            setForm({ dueDate: '', discount: 0, paymentMethod: 'CREDIT_CARD', notes: '' });
            setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
            loadInvoices(parseInt(selectedPatientId));
        } catch (err) { console.error(err); }
    };

    const handleViewDetail = (invoice: any) => {
        setSelectedInvoice(invoice);
        setDetailDialog(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Invoices</Typography>
                <Button variant="contained" disabled={!selectedPatientId} startIcon={<Add />} onClick={() => setDialogOpen(true)}>
                    New Invoice
                </Button>
            </Box>

            <TextField select label="Select Patient" value={selectedPatientId}
                onChange={(e) => handleSelectPatient(e.target.value)} fullWidth sx={{ mb: 3 }}>
                {patients.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name} - {p.cpf}</MenuItem>
                ))}
            </TextField>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice #</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Paid</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((inv) => (
                            <TableRow key={inv.id}>
                                <TableCell>{inv.invoiceNumber}</TableCell>
                                <TableCell>{new Date(inv.issueDate).toLocaleDateString()}</TableCell>
                                <TableCell>R$ {inv.totalAmount?.toFixed(2)}</TableCell>
                                <TableCell>R$ {inv.paidAmount?.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip label={inv.status} color={statusColors[inv.status] || 'default'} size="small" />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleViewDetail(inv)}><Visibility /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>New Invoice</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <TextField label="Due Date" type="date" fullWidth value={form.dueDate}
                                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField label="Discount" type="number" fullWidth value={form.discount}
                                onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField select label="Payment Method" fullWidth value={form.paymentMethod}
                                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                                <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                                <MenuItem value="CASH">Cash</MenuItem>
                                <MenuItem value="INSURANCE">Insurance</MenuItem>
                                <MenuItem value="PIX">PIX</MenuItem>
                                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Notes" multiline rows={2} fullWidth value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Items</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Unit Price</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <TextField size="small" value={item.description}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[index].description = e.target.value;
                                                            setItems(newItems);
                                                        }} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" type="number" value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[index].quantity = parseInt(e.target.value) || 0;
                                                            setItems(newItems);
                                                        }} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" type="number" value={item.unitPrice}
                                                        onChange={(e) => {
                                                            const newItems = [...items];
                                                            newItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                                            setItems(newItems);
                                                        }} />
                                                </TableCell>
                                                <TableCell>R$ {(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<Add />} onClick={handleAddItem} sx={{ mt: 1 }}>Add Item</Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate}>Create</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Invoice {selectedInvoice?.invoiceNumber}</DialogTitle>
                <DialogContent>
                    {selectedInvoice && (
                        <Box>
                            <Typography>Patient: {selectedInvoice.patient?.name}</Typography>
                            <Typography>Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</Typography>
                            <Typography>Due Date: {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : '-'}</Typography>
                            <Typography>Total: R$ {selectedInvoice.totalAmount?.toFixed(2)}</Typography>
                            <Typography>Paid: R$ {selectedInvoice.paidAmount?.toFixed(2)}</Typography>
                            <Typography>Discount: R$ {selectedInvoice.discount?.toFixed(2)}</Typography>
                            <Chip label={selectedInvoice.status} color={statusColors[selectedInvoice.status] || 'default'} sx={{ mt: 1 }} />
                            {selectedInvoice.notes && <Typography sx={{ mt: 1 }}>Notes: {selectedInvoice.notes}</Typography>}
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items:</Typography>
                            {selectedInvoice.items?.map((item: any, idx: number) => (
                                <Typography key={idx} variant="body2">
                                    {item.description} x{item.quantity} - R$ {item.totalPrice?.toFixed(2)}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InvoicesPage;
