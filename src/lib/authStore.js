import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

// Initialize API client with token from localStorage
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('zebra-token');
  if (token) {
    api.setToken(token);
  }
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      init: () => {
        const token = localStorage.getItem('zebra-token');
        if (token) {
          // Set both localStorage and cookie
          document.cookie = `zebra-token=${token}; path=/; secure; samesite=strict`;
          api.setToken(token);
          set({ isAuthenticated: true });
        }
      },

      setAuthState: (user, token) => {
        // Set both localStorage and cookie
        localStorage.setItem('zebra-token', token);
        document.cookie = `zebra-token=${token}; path=/; secure; samesite=strict`;
        api.setToken(token);
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.register(email, password, name);
          get().setAuthState(data.user, data.token);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.login(email, password);
          get().setAuthState(data.user, data.token);
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        api.clearToken();
        // Clear both localStorage and cookie
        localStorage.removeItem('zebra-token');
        document.cookie = 'zebra-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'zebra-auth',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
