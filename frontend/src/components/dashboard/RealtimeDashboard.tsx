import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useSettingsStore } from '../../core/store/settingsStore';

export const RealtimeDashboard: React.FC = () => {
  const { formatMoney } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Realtime</h1>
          <p className="text-slate-500 text-sm">Métricas del negocio en tiempo real</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">Ventas Hoy</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{formatMoney(1245000)}</p>
          <span className="text-xs text-emerald-600 font-bold inline-block">+15% respecto a ayer</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">Transacciones</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">84</p>
          <span className="text-xs text-indigo-600 font-bold inline-block">Promedio {formatMoney(14821)} / ticket</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">Clientes Atendidos</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">62</p>
          <span className="text-xs text-purple-600 font-bold inline-block">12 Clientes frecuentes</span>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase">Margen Promedio</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">38.5%</p>
          <span className="text-xs text-amber-600 font-bold inline-block">Estable</span>
        </div>
      </div>
    </div>
  );
};
