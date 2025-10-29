// src/services/api.ts - DIPERBAIKI
import axios, { AxiosError } from 'axios';

// Hapus 'declare module' yang sebelumnya ada di sini jika Anda menambahkannya.

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (Tidak berubah)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface BackendError {
  success: boolean;
  error: string;
}

// Response interceptor (Diperbarui)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<BackendError>) => {
    // 1. Ubah 'error.config' menjadi 'any' untuk bypass pengecekan tipe TypeScript
    const originalRequest = error.config as any;

    // 2. Sekarang 'originalRequest._retry' akan valid
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // Set properti kustom

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-tokens`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Blok penanganan error (Tidak berubah)
    if (error.response && error.response.data && error.response.data.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    // Fallback
    return Promise.reject(error);
  }
);