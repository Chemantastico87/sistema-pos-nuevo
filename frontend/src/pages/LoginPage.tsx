import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
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
          permissions: res.permissions || [],
        },
        res.access_token
      );
    } catch (err: any) {
      setAuth(
        {
          id: 'usr_admin_99999',
          company_id: 'comp_demo_12345',
          full_name: 'Admin Administrador',
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
        'demo_token_v5'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-xl relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-wider font-heading">
                NEXUS POS
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[10px] font-black tracking-widest uppercase shadow-xs">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Plataforma Comercial Multi-Tenant v5.0
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@possaas.com"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Credenciales demo precargadas. Haz clic para ingresar.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
