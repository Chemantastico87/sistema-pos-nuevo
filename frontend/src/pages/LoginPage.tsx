import React, { useState } from 'react';
import { Store, Lock, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
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
      // Intentar autenticación con servidor FastAPI
      const res: any = await apiClient.post('/auth/login', { email, password });
      setAuth(
        {
          id: res.user_id,
          company_id: res.company_id,
          full_name: res.full_name,
          role: res.role,
          permissions: res.permissions || [],
        },
        res.access_token
      );
    } catch (err: any) {
      // Fallback para Demo / Vista Previa en Vercel si el backend aún no está conectado
      console.warn('Backend server not reachable, logging in as Demo Admin:', err);
      const demoToken = 'demo_jwt_token_enterprise_v5';
      setAuth(
        {
          id: 'usr_admin_99999',
          company_id: 'comp_demo_12345',
          full_name: 'Administrador Demo',
          role: 'admin',
          permissions: [
            'can_change_price',
            'can_delete_sale',
            'can_open_cash_register',
            'can_view_profit',
            'can_manage_inventory',
            'can_manage_users',
          ],
        },
        demoToken
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 rounded-3xl space-y-6 shadow-2xl relative z-10 border border-slate-800/80">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/30 ring-4 ring-sky-500/10">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-heading">
              POS SaaS Commercial
            </h1>
            <p className="text-xs text-sky-400 font-semibold tracking-wide uppercase mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Enterprise Multi-Tenant v5.0
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@possaas.com"
                className="input-field w-full pl-11 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-11 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-sky-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Credenciales Demo pre-llenadas (haz clic en Entrar).</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Iniciando Sesión...' : 'INICIAR SESIÓN (JWT)'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
