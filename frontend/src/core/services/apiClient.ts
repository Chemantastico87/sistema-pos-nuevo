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
      if (typeof rawMsg === 'string' && (rawMsg.startsWith('error.') || rawMsg.startsWith('errors.'))) {
        const translated = t(rawMsg);
        if (translated && translated !== rawMsg) return translated;
      }
      return typeof rawMsg === 'string' ? rawMsg : JSON.stringify(rawMsg);
    }
  }

  // Errores HTTP explícitos sin mensajes genéricos ni ocultaciones
  switch (status) {
    case 400:
      return 'Solicitud incorrecta (HTTP 400). Verifique los datos enviados.';
    case 401:
      return 'Credenciales inválidas (HTTP 401). Correo o contraseña incorrectos.';
    case 403:
      return 'Acceso restringido (HTTP 403). La cuenta requiere verificación de correo o está suspendida.';
    case 404:
      return 'Recurso no encontrado en el servidor (HTTP 404).';
    case 409:
      return 'Conflicto (HTTP 409). El registro o empresa ya existe.';
    case 422:
      return 'Error de formato en datos (HTTP 422). Verifique los campos ingresados.';
    case 500:
      return 'El servidor devolvió HTTP 500. Fallo en la respuesta del backend.';
    default:
      return `Respuesta de error de servidor (HTTP ${status || 'Desconocido'}).`;
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
