// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  UserRole,
  AuthResponse,
  AdminCreateUserRequest,
} from '../types';
import { authService } from '../services/auth.service';

interface UpdateProfileRequest {
  name?: string;
  password?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  updateUserRole: (userId: string, role: UserRole) => Promise<User>;
  adminCreateUser: (
    data: AdminCreateUserRequest
  ) => Promise<AuthResponse>;
  // --- ACTION BARU DITAMBAHKAN ---
  adminDeleteUser: (userId: string) => Promise<void>;
  // --- AKHIR BLOK TAMBAHAN ---
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthLoading: true,

      // ... (login, register, logout, checkAuth, setLoading, updateProfile, getAllUsers, updateUserRole, adminCreateUser tidak berubah) ...
      login: async (email: string, password: string) => {
        set({ isAuthLoading: true });
        try {
          const response = await authService.login({ email, password });
          localStorage.setItem('accessToken', response.tokens.accessToken);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          set({
            user: response.user,
            isAuthenticated: true,
            isAuthLoading: false,
          });
        } catch (error) {
          set({ isAuthLoading: false });
          throw error;
        }
      },
      register: async (email: string, password: string, name: string) => {
        set({ isAuthLoading: true });
        try {
          const response = await authService.register({ email, password, name });
          localStorage.setItem('accessToken', response.tokens.accessToken);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          set({
            user: response.user,
            isAuthenticated: true,
            isAuthLoading: false,
          });
        } catch (error) {
          set({ isAuthLoading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ 
            user: null, 
            isAuthenticated: false,
            isAuthLoading: false
          });
        }
      },
      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null, isAuthLoading: false });
          return;
        }
        try {
          const user = await authService.getProfile();
          set({ 
            user, 
            isAuthenticated: true,
            isAuthLoading: false
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ 
            isAuthenticated: false, 
            user: null,
            isAuthLoading: false
          });
        }
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      updateProfile: async (data: UpdateProfileRequest) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authService.updateProfile(data);
          set({
            user: updatedUser,
            isLoading: false,
          });
          return updatedUser;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      getAllUsers: async () => {
        set({ isLoading: true });
        try {
          const users = await authService.getAllUsers();
          set({ isLoading: false });
          return users;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      updateUserRole: async (userId: string, role: UserRole) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authService.updateUserRole(userId, role);
          set({ isLoading: false });
          return updatedUser;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      adminCreateUser: async (data: AdminCreateUserRequest) => {
        set({ isLoading: true });
        try {
          const response = await authService.adminCreateUser(data);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      // --- FUNGSI BARU DITAMBAHKAN ---
      adminDeleteUser: async (userId: string) => {
        set({ isLoading: true }); // Gunakan isLoading yang lama
        try {
          await authService.adminDeleteUser(userId);
          set({ isLoading: false });
          // Tidak perlu update state user lokal, biarkan halaman me-refresh
        } catch (error) {
          set({ isLoading: false });
          throw error; // Biarkan komponen UI menangani error
        }
      },
      // --- AKHIR BLOK TAMBAHAN ---
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
      }),
    }
  )
);