import { create } from 'zustand';

export interface User {
  id: string;
  company_id: string;
  company_name?: string;
  full_name: string;
  role: string;
  status?: string;
  email_verified?: boolean;
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

const safeParseUser = (): User | null => {
  try {
    const data = localStorage.getItem('pos_user_data');
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.id && parsed.company_id) {
      return parsed;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = safeParseUser();
  const initialToken = initialUser ? localStorage.getItem('access_token') : null;

  return {
    user: initialUser,
    token: initialToken,
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
      if (typeof document !== 'undefined') {
        document.cookie = 'vendix_lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      set({ user: null, token: null, refreshToken: null });
    },
  };
});
