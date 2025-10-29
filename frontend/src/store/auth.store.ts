// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.login({ email, password });
          localStorage.setItem('accessToken', response.tokens.accessToken);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const response = await authService.register({ email, password, name });
          localStorage.setItem('accessToken', response.tokens.accessToken);
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getProfile();
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ 
            isAuthenticated: false, 
            user: null,
            isLoading: false 
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);