import { create } from 'zustand';

const TOKEN_KEY = 'notiflow_token';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: Boolean(localStorage.getItem(TOKEN_KEY)),

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },
}));
