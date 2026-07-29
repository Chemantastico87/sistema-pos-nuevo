import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, Package, Warehouse, Wallet, Users, Receipt, ShieldCheck } from 'lucide-react';

const navItems = [
  { to: '/', label: 'POS Terminal (F1-F5)', icon: ShoppingCart },
  { to: '/dashboard', label: 'Dashboard Realtime', icon: LayoutDashboard },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/inventory', label: 'Inventario', icon: Warehouse },
  { to: '/cash', label: 'Caja & Arqueo', icon: Wallet },
  { to: '/customers', label: 'Clientes', icon: Users },
  { to: '/tickets', label: 'Tickets ESC/POS', icon: Receipt },
  { to: '/audit', label: 'Auditoría & Diff', icon: ShieldCheck },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-blue-600/10 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </aside>
  );
};
