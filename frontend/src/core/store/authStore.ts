import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

export interface User {
  id: string;
  company_id: string;
  company_name?: string;
  email?: string;
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
  isAuthenticated?: boolean;
  isOfflineMode?: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  registerCompany: (data: any) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
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

export const useAuthStore = create<AuthState>((set, get) => {
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

      // Sincronización asíncrona de la sesión en IndexedDB (DexieDB) para modo offline real
      import('../db/offlineAuthService').then(({ saveSyncedCompanySession }) => {
        saveSyncedCompanySession({
          user_id: user.id,
          company_id: user.company_id,
          company_name: user.company_name,
          email: (user as any).email || 'admin@vendix.com',
          role: user.role,
          full_name: user.full_name,
          currency: user.currency,
          plan: user.plan
        }).catch(() => {});
      }).catch(() => {});
    },
    login: async (email: string, password: string) => {
      const res: any = await apiClient.post('/api/v1/auth/login', { email, password });
      const user: User = {
        id: res.user_id,
        company_id: res.company_id,
        full_name: res.full_name,
        role: res.role,
        status: res.status,
        email_verified: res.email_verified,
        permissions: res.permissions || [],
        onboarding_completed: res.onboarding_completed,
        currency: res.currency,
        plan: res.plan,
        subscription_status: res.subscription_status
      };
      get().setAuth(user, res.access_token, res.refresh_token);
    },
    registerCompany: async (data: any) => {
      const res: any = await apiClient.post('/api/v1/auth/register-company', data);
      const user: User = {
        id: res.user_id,
        company_id: res.company_id,
        company_name: data.company_name,
        full_name: res.full_name,
        role: res.role,
        status: res.status,
        email_verified: res.email_verified,
        permissions: res.permissions || [],
        onboarding_completed: res.onboarding_completed,
        currency: res.currency,
        plan: res.plan,
        subscription_status: res.subscription_status
      };
      get().setAuth(user, res.access_token, res.refresh_token);
    },
    forgotPassword: async (email: string) => {
      await apiClient.post('/api/v1/auth/forgot-password', { email });
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
