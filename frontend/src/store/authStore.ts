import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  preferences?: {
    dietaryPreferences: string[];
    allergies: string[];
    dislikedIngredients: string[];
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
  updateUser: (user: Partial<AuthUser>) => void;
  setLoadingUser: (loading: boolean) => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoadingUser: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoadingUser: false });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoadingUser: false });
      },

      setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
      },

      updateUser: (userData) =>
        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...userData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return { user: updatedUser };
        }),

      setLoadingUser: (loading) => set({ isLoadingUser: loading }),

      hydrateFromStorage: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true, isLoadingUser: false });
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false, isLoadingUser: false });
          }
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoadingUser: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
