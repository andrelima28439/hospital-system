import api from './api';

export interface InvoiceItemData {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    patientId: number;
    dueDate?: string;
    discount?: number;
    paymentMethod?: string;
    notes?: string;
    items: InvoiceItemData[];
}

export const invoiceService = {
    create: (data: InvoiceData) => api.post('/invoices', data),
    findByPatient: (patientId: number, params?: any) => api.get(`/invoices/patient/${patientId}`, { params }),
    findById: (id: number) => api.get(`/invoices/${id}`),
    pay: (id: number, amount: number) => api.post(`/invoices/${id}/pay`, { amount }),
    cancel: (id: number) => api.post(`/invoices/${id}/cancel`),
};
