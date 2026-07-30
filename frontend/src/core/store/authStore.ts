import { create } from 'zustand';

export interface User {
  id: string;
  company_id: string;
  company_name?: string;
  full_name: string;
  role: string;
  permissions: string[];
  onboarding_completed?: boolean;
  currency?: string;
  plan?: string;
  subscription_status?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('pos_user_data') || 'null'),
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('pos_user_data', JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, token, refreshToken });
  },
  setOnboardingCompleted: (completed) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, onboarding_completed: completed };
      localStorage.setItem('pos_user_data', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('pos_user_data');
    sessionStorage.clear();
    set({ user: null, token: null, refreshToken: null });
  },
}));
