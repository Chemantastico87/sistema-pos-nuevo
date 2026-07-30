import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Monitor, Package, Users, Warehouse, 
  Wallet, BarChart3, Receipt, UserCheck, Settings, Grid, ChevronDown,
  ShieldCheck, CreditCard, Database, Activity, HelpCircle, AlertOctagon, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../core/store/authStore';

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  const navItems = [
    { to: '/dashboard', label: 'VENDIX Insights', icon: Home },
    { to: '/', label: 'VENDIX POS TPV', icon: Monitor },
    { to: '/products', label: 'Productos', icon: Package },
    { to: '/customers', label: 'Clientes', icon: Users },
    { to: '/inventory', label: 'Inventario', icon: Warehouse },
    { to: '/cash', label: 'Caja & Cierre', icon: Wallet },
    { to: '/reports', label: 'Reportes', icon: BarChart3 },
    { to: '/tickets', label: 'Tickets', icon: Receipt },
    { to: '/users', label: 'Usuarios', icon: UserCheck },
    { to: '/subscriptions', label: 'Suscripción', icon: CreditCard },
    { to: '/backups', label: 'Backups Enterprise', icon: Database },
    { to: '/health', label: 'Salud Sistema', icon: Activity },
    { to: '/error-logs', label: 'Visor Errores', icon: AlertOctagon },
    { to: '/help', label: 'Soporte & Roadmap', icon: HelpCircle },
    { to: '/settings', label: 'Configuración', icon: Settings },
  ];

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    navItems.unshift({ to: '/superadmin', label: 'VENDIX Cloud', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-20 shrink-0 select-none border-r border-slate-800/80 font-sans">
      <div className="space-y-6">
        {/* LOGOTIPO OFICIAL VENDIX: MONOGRAMA GEOMÉTRICO "V" TICKET (SIN RAYO) */}
        <div className="space-y-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/30 relative">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative">
                {/* SVG Monograma Geométrico V en Ticket Minimalista */}
                <svg className="w-6 h-6 text-indigo-400 fill-current" viewBox="0 0 24 24">
                  <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1.6.8L16.5 18l-3.5 2.5a1 1 0 0 1-1.2 0L8.3 18l-2.9 2.8A1 1 0 0 1 3 20V4a1 1 0 0 1 1-1zm3 3v10.5l2-1.9a1 1 0 0 1 1.3 0l2.7 1.9 2.7-1.9a1 1 0 0 1 1.3 0l2 1.9V6H7zm2 3h6v2H9V9zm0 4h4v2H9v-2z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-xl text-white tracking-widest font-heading">VENDIX</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[9px] font-black tracking-widest uppercase shadow-xs">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Business POS v5.0</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="font-bold text-slate-200 truncate">{user?.company_name || 'Mi Empresa POS'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-400 font-bold uppercase">{user?.plan || 'Starter'}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-22rem)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-900">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VENDIX Cloud</p>
            <p className="text-xs font-extrabold text-emerald-400">Operacional</p>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
