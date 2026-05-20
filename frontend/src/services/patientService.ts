import api from './api';

export interface PatientData {
    id?: number;
    name: string;
    cpf?: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string;
    medicalConditions?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
}

export const patientService = {
    findAll: (params?: any) => api.get('/patients', { params }),
    findById: (id: number) => api.get(`/patients/${id}`),
    create: (data: PatientData) => api.post('/patients', data),
    update: (id: number, data: PatientData) => api.put(`/patients/${id}`, data),
    deactivate: (id: number) => api.delete(`/patients/${id}`),
};
