// src/services/auth.service.ts
import { api } from './api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', userData);
    return response.data.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<{ data: { user: User } }>('/auth/profile');
    return response.data.data.user;
  },

  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/refresh-tokens', {
      refreshToken,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};