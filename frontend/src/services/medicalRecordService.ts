import api from './api';

export interface MedicalRecordData {
    patientId: number;
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
}

export const medicalRecordService = {
    create: (data: MedicalRecordData) => api.post('/medical-records', data),
    getPatientHistory: (patientId: number) => api.get(`/medical-records/patient/${patientId}`),
    update: (id: number, data: MedicalRecordData) => api.put(`/medical-records/${id}`, data),
    addAttachment: (id: number, file: FormData) =>
        api.post(`/medical-records/${id}/attachments`, file, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};
