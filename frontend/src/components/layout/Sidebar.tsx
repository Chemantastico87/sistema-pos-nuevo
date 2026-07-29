import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShoppingBag, Home, Monitor, Package, Users, Warehouse, 
  Wallet, BarChart3, Receipt, UserCheck, Settings, Grid, ChevronDown, CheckCircle2 
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: Home },
  { to: '/', label: 'POS', icon: Monitor },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/customers', label: 'Clientes', icon: Users },
  { to: '/inventory', label: 'Inventario', icon: Warehouse },
  { to: '/cash', label: 'Caja', icon: Wallet },
  { to: '/audit', label: 'Reportes', icon: BarChart3 },
  { to: '/tickets', label: 'Tickets', icon: Receipt },
  { to: '/users', label: 'Usuarios', icon: UserCheck },
  { to: '/settings', label: 'Configuración', icon: Settings },
  { to: '/plugins', label: 'Apps & Plugins', icon: Grid },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl z-20 shrink-0 select-none">
      <div className="space-y-6">
        {/* Logo & Tenant Header */}
        <div className="space-y-3 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight">SISTEM POS</h1>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer">
            <span>Mi Empresa S.A.S</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
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
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
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

      {/* Bottom Footer & Online Status */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Sincronización</p>
            <p className="text-xs font-bold text-emerald-400">En línea</p>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center space-y-0.5">
          <p className="font-semibold text-slate-400">SISTEM POS v1.0.0</p>
          <p>© 2024 Todos los derechos reservados</p>
        </div>
      </div>
    </aside>
  );
};
