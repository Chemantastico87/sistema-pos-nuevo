import React, { useState } from 'react';
import { Store, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../core/store/authStore';
import { apiClient } from '../core/services/apiClient';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@possaas.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.post('/auth/login', { email, password });
      setAuth(
        {
          id: res.user_id,
          company_id: res.company_id,
          full_name: res.full_name,
          role: res.role,
          permissions: res.permissions,
        },
        res.access_token
      );
    } catch (err: any) {
      setError(err.message || 'Error de inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md glass-card p-8 rounded-3xl space-y-6 shadow-2xl shadow-sky-500/10 border border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/30">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Iniciar Sesión POS SaaS</h1>
          <p className="text-sm text-slate-400">Acceso multiempresa enterprise v5.0</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base font-bold">
            {isLoading ? 'Autenticando...' : 'INICIAR SESIÓN (JWT)'}
          </button>
        </form>
      </div>
    </div>
  );
};
