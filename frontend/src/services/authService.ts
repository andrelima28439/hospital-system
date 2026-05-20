import api from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    cpf?: string;
    role: string;
    specialty?: string;
    crm?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    name: string;
    email: string;
    role: string;
}

export const authService = {
    login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
    register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
    refreshToken: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh-token', { refreshToken }),
};
