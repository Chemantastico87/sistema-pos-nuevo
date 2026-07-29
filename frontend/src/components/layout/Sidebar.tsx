import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Monitor, Package, Users, Warehouse, 
  Wallet, BarChart3, Receipt, UserCheck, Settings, Grid, ChevronDown, Zap, Sparkles
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
  { to: '/users', label: 'Usuarios & Poder', icon: UserCheck },
  { to: '/settings', label: 'Configuración', icon: Settings },
  { to: '/plugins', label: 'Apps & Plugins', icon: Grid },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-20 shrink-0 select-none border-r border-slate-800/80">
      <div className="space-y-6">
        {/* Logo Original & Llamativo */}
        <div className="space-y-3 px-1">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/40 relative group">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative">
                <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-lg text-white tracking-wider font-heading">NEXUS POS</h1>
                <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-[9px] font-black tracking-widest uppercase shadow-xs">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Enterprise SaaS v5.0</p>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium text-slate-300 hover:bg-slate-800/80 transition-colors cursor-pointer">
            <span className="font-bold text-slate-200">Mi Empresa S.A.S</span>
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

      {/* Bottom Footer & Online Status */}
      <div className="space-y-4 pt-4 border-t border-slate-900">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sincronización</p>
            <p className="text-xs font-extrabold text-emerald-400">En línea (Cloud API)</p>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          </div>
        </div>

        <div className="text-[11px] text-slate-500 text-center space-y-0.5">
          <p className="font-extrabold text-slate-400">NEXUS POS v5.0 PRO</p>
          <p>© 2026 Todos los derechos reservados</p>
        </div>
      </div>
    </aside>
  );
};
