const BASE_URL = '/api/v1';

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      let errorMessage = `Error HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch (e) {
        const text = await res.text().catch(() => '');
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
          errorMessage = 'El servidor devolvió una página HTML en lugar de JSON. Compruebe la ruta /api/v1.';
        }
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errorMessage = `Error HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch (e) {
        const text = await res.text().catch(() => '');
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
          errorMessage = 'El servidor de API no está respondiendo en Vercel (Reescritura HTML).';
        }
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let errorMessage = `Error HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch (e) {
        // fallback
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let errorMessage = `Error HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch (e) {
        // fallback
      }
      throw new Error(errorMessage);
    }
    return res.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      let errorMessage = `Error HTTP ${res.status}`;
      try {
        const errData = await res.json();
        errorMessage = errData.detail || errData.message || errorMessage;
      } catch (e) {
        // fallback
      }
      throw new Error(errorMessage);
    }
    return res.json();
  }
};
