import axios from 'axios';
import { Lap, TelemetryDataPoint, Session } from '@/types';

// Use empty string for production (nginx proxy), localhost:8000 for dev
// Check for undefined specifically, not falsy, so empty string works
const baseURL = process.env.NEXT_PUBLIC_API_URL === undefined
    ? 'http://localhost:8000'
    : process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Define API methods using the 'api' axios instance
export const lapsApi = {
    async getLaps(params?: any) {
        return api.get<Lap[]>("/api/laps", { params });
    },

    async getLap(id: number) {
        return api.get<Lap>(`/api/laps/${id}`);
    },

    async getLapTelemetry(id: number) {
        return api.get<TelemetryDataPoint[]>(`/api/laps/${id}/telemetry`);
    },

    async deleteLap(id: number) {
        return api.delete(`/api/laps/${id}`);
    },
};

export const sessionsApi = {
    async getSessions(params?: any) {
        return api.get<Session[]>("/api/sessions", { params });
    },

    async getSession(id: number) {
        return api.get<Session>(`/api/sessions/${id}`);
    },

    async deleteSession(id: number) {
        return api.delete(`/api/sessions/${id}`);
    },
};

export const tracksApi = {
    async getTracks() {
        return api.get<any[]>("/api/tracks");
    },
    async createTrack(data: any) {
        return api.post("/api/tracks", data);
    },
    async updateTrack(id: number, data: any) {
        return api.put(`/api/tracks/${id}`, data);
    },
    async deleteTrack(id: number) {
        return api.delete(`/api/tracks/${id}`);
    },
};

export const kartsApi = {
    async getKarts() {
        return api.get<any[]>("/api/equipment/karts");
    },
    async createKart(data: any) {
        return api.post("/api/equipment/karts", data);
    },
    async updateKart(id: number, data: any) {
        return api.put(`/api/equipment/karts/${id}`, data);
    },
    async deleteKart(id: number) {
        return api.delete(`/api/equipment/karts/${id}`);
    },
};

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login if unauthorized
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Only redirect if not already on login/register pages
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
