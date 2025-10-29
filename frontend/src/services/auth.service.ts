// src/services/auth.service.ts
import { api } from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserRole,
  AdminCreateUserRequest,
} from '../types';

interface UpdateProfileRequest {
  name?: string;
  password?: string;
}

interface BackendResponse<T> {
  success: boolean;
  data?: T; // Data bisa opsional, terutama untuk delete
  message?: string;
}

export const authService = {
  // ... (login, register, getProfile, refreshTokens, logout, updateProfile, getAllUsers, updateUserRole, adminCreateUser tidak berubah) ...
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!; // Asumsikan data selalu ada jika sukses
  },
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>(
      '/auth/register',
      userData
    );
    return response.data.data!;
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get<BackendResponse<{ user: User }>>(
      '/auth/profile'
    );
    return response.data.data!.user;
  },
  refreshTokens: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>(
      '/auth/refresh-tokens',
      { refreshToken }
    );
    return response.data.data!;
  },
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed', error);
    }
  },
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch<BackendResponse<{ user: User }>>(
      '/auth/profile',
      data
    );
    return response.data.data!.user;
  },
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<BackendResponse<{ users: User[] }>>(
      '/users'
    );
    return response.data.data!.users;
  },
  updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
    const response = await api.patch<BackendResponse<{ user: User }>>(
      `/users/${userId}/role`,
      { role }
    );
    return response.data.data!.user;
  },
  adminCreateUser: async (
    userData: AdminCreateUserRequest
  ): Promise<AuthResponse> => {
    const response = await api.post<BackendResponse<AuthResponse>>(
      '/users',
      userData
    );
    return response.data.data!;
  },

  // --- FUNGSI BARU DITAMBAHKAN ---
  /**
   * [ADMIN] Menghapus user berdasarkan ID
   */
  adminDeleteUser: async (userId: string): Promise<void> => {
    // Axios akan melempar error jika status bukan 2xx
    await api.delete(`/users/${userId}`); // Mengarah ke DELETE /api/users/:id
    // Tidak ada data yang dikembalikan pada delete sukses
  },
  // --- AKHIR BLOK TAMBAHAN ---
};