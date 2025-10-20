import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberId?: string;
  role: string;
  membershipStatus: string;
  landesverband?: string;
  kreisverband?: string;
  isActive: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  memberId?: string;
  landesverband?: string;
  kreisverband?: string;
  postalCode?: string;
  city?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/api/auth/login', { email, password });
          const { token, user } = response.data.data;
          
          localStorage.setItem('token', token);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          toast.success('Erfolgreich angemeldet!');
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/api/auth/register', data);
          const { user } = response.data.data;
          
          toast.success('Registrierung erfolgreich! Bitte melden Sie sich an.');
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          toast.success('Erfolgreich abgemeldet');
        }
      },

      fetchUser: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isAuthenticated: false, user: null });
            return;
          }

          const response = await api.get('/api/auth/me');
          const { user } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
