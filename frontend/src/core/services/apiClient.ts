import { useLanguageStore } from '../store/languageStore';

const BASE_URL = '/api/v1';

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  const activeLang = useLanguageStore.getState().language || 'es';
  return {
    'Content-Type': 'application/json',
    'Accept-Language': activeLang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const resolveBackendError = (status: number, errData: any): string => {
  const t = useLanguageStore.getState().t;

  if (errData && typeof errData === 'object') {
    const rawMsg = errData.detail || errData.message || errData.error_key;
    if (rawMsg) {
      // Si el mensaje devuelto por la API es una clave de error conocida (ej: "error.user_not_found")
      if (rawMsg.startsWith('error.') || rawMsg.startsWith('errors.')) {
        return t(rawMsg);
      }
      return rawMsg;
    }
  }

  // Traducción basada en Código HTTP de Estado
  switch (status) {
    case 401:
      return t('errors.http_401');
    case 403:
      return t('errors.http_403');
    case 404:
      return t('errors.http_404');
    case 409:
      return t('errors.http_409');
    case 422:
      return t('errors.http_422');
    case 500:
    default:
      return t('errors.http_500');
  }
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('/api') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // Fallback
        }
        if (res.status === 401 && !endpoint.includes('/auth/login')) {
          const { useAuthStore } = await import('../store/authStore');
          useAuthStore.getState().logout();
        }
        throw new Error(resolveBackendError(res.status, errData));
      }
      return res.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(useLanguageStore.getState().t('errors.network_error'));
      }
      throw err;
    }
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = endpoint.startsWith('/api') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // Fallback
        }
        throw new Error(resolveBackendError(res.status, errData));
      }
      return res.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(useLanguageStore.getState().t('errors.network_error'));
      }
      throw err;
    }
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const url = endpoint.startsWith('/api') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // Fallback
        }
        throw new Error(resolveBackendError(res.status, errData));
      }
      return res.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(useLanguageStore.getState().t('errors.network_error'));
      }
      throw err;
    }
  },

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const url = endpoint.startsWith('/api') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // Fallback
        }
        throw new Error(resolveBackendError(res.status, errData));
      }
      return res.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(useLanguageStore.getState().t('errors.network_error'));
      }
      throw err;
    }
  },

  async delete<T>(endpoint: string): Promise<T> {
    const url = endpoint.startsWith('/api') ? endpoint : `${BASE_URL}${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // Fallback
        }
        throw new Error(resolveBackendError(res.status, errData));
      }
      return res.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        throw new Error(useLanguageStore.getState().t('errors.network_error'));
      }
      throw err;
    }
  }
};
