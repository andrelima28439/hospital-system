import api from './api';

export interface BedData {
    id?: number;
    bedNumber: string;
    ward: string;
    room?: string;
    status: string;
    patient?: any;
}

export const bedService = {
    findAll: () => api.get('/beds'),
    findById: (id: number) => api.get(`/beds/${id}`),
    create: (data: BedData) => api.post('/beds', data),
    occupy: (bedId: number, patientId: number) => api.post(`/beds/${bedId}/occupy`, { patientId }),
    release: (bedId: number) => api.post(`/beds/${bedId}/release`),
    updateStatus: (bedId: number, status: string) => api.put(`/beds/${bedId}/status`, { status }),
    getStats: () => api.get('/beds/stats'),
};
