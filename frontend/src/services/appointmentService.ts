import api from './api';

export interface AppointmentData {
    id?: number;
    patientId: number;
    doctorId: number;
    dateTime: string;
    notes?: string;
    reason?: string;
}

export const appointmentService = {
    create: (data: AppointmentData) => api.post('/appointments', data),
    findByPatient: (patientId: number, params?: any) => api.get('/appointments', { params: { patientId, ...params } }),
    findByDoctor: (doctorId: number, params?: any) => api.get('/appointments', { params: { doctorId, ...params } }),
    update: (id: number, data: AppointmentData) => api.put(`/appointments/${id}`, data),
    cancel: (id: number) => api.delete(`/appointments/${id}`),
    getAvailableSlots: (doctorId: number, date: string) =>
        api.get('/appointments/available-slots', { params: { doctorId, date } }),
};
