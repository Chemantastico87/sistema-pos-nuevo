import React from 'react';
import { Check, X, Shield, Lock, Eye, Monitor, Warehouse, Wallet, Settings, Users, BarChart3 } from 'lucide-react';

interface VisualPermissionsProps {
  permissions: string[];
  onChange?: (newPermissions: string[]) => void;
  readOnly?: boolean;
}

export const VisualPermissions: React.FC<VisualPermissionsProps> = ({ permissions, onChange, readOnly = false }) => {
  const permissionModules = [
    { key: 'can_open_cash_register', name: 'TPV & Cobro', desc: 'Permite operar la caja y realizar cobros', icon: Monitor },
    { key: 'can_manage_inventory', name: 'Gestión de Inventario', desc: 'Permite crear y editar productos o stock', icon: Warehouse },
    { key: 'can_reopen_cash_register', name: 'Arqueo & Cierre de Caja', desc: 'Permite cerrar o reabrir cajas diarias', icon: Wallet },
    { key: 'can_manage_users', name: 'Gestión de Personal', desc: 'Permite dar de alta empleados y permisos', icon: Users },
    { key: 'can_view_profit', name: 'VENDIX Insights & Margen', desc: 'Ver informes de beneficio y analítica', icon: BarChart3 },
    { key: 'can_manage_settings', name: 'Configuración Empresa', desc: 'Configurar datos fiscales y series TPV', icon: Settings },
  ];

  const togglePermission = (key: string) => {
    if (readOnly || !onChange) return;
    if (permissions.includes(key)) {
      onChange(permissions.filter((p) => p !== key));
    } else {
      onChange([...permissions, key]);
    }
  };

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-bold text-slate-900">Matriz de Permisos Visuales VENDIX</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {permissionModules.map((m) => {
          const isAllowed = permissions.includes(m.key);
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              onClick={() => togglePermission(m.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isAllowed
                  ? 'bg-emerald-50/60 border-emerald-300/80 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  isAllowed ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-xs font-bold block">{m.name}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">{m.desc}</span>
                </div>
              </div>

              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                isAllowed ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
              }`}>
                {isAllowed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
