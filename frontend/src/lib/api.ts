import axios from 'axios';
import type { AlertsResponse, AuthResponse, BenchmarksResponse, ContractsResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (full_name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { full_name, email, password }),
};

export const dashboardApi = {
  health: () => api.get('/health'),
  benchmarks: () => api.get<BenchmarksResponse>('/benchmarks'),
  contracts: (page = 1, limit = 8) => api.get<ContractsResponse>(`/contracts?page=${page}&limit=${limit}`),
  alerts: (page = 1, limit = 8) => api.get<AlertsResponse>(`/alerts?page=${page}&limit=${limit}`),
};

export default api;
