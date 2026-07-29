import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// In dev, Vite's proxy forwards '/api' to localhost:5000, so the relative
// path works with no env var needed. In production the frontend (Vercel)
// and backend (Render) are on different domains, so '/api' would just 404
// against the Vercel domain — VITE_API_URL must point at the deployed
// backend, e.g. https://your-app.onrender.com/api.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);