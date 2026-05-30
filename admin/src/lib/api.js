import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('hiru-admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/api/auth/login')) {
      sessionStorage.removeItem('hiru-admin-token');
      sessionStorage.removeItem('hiru-admin-email');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
