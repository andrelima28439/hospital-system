import api from './api';

export interface PrescriptionItemData {
    medicationName: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
}

export interface PrescriptionData {
    patientId: number;
    issueDate?: string;
    validUntil?: string;
    notes?: string;
    items: PrescriptionItemData[];
}

export const prescriptionService = {
    create: (data: PrescriptionData) => api.post('/prescriptions', data),
    getPatientPrescriptions: (patientId: number) => api.get(`/prescriptions/patient/${patientId}`),
    generatePdf: (id: number) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};
