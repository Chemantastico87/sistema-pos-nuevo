import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Users } from 'lucide-react';

export const RealtimeDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard Realtime</h1>
          <p className="text-slate-400 text-sm">Métricas del negocio en tiempo real vía WebSockets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Ventas Hoy</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-4">$12,450.00</p>
          <span className="text-xs text-emerald-400 font-semibold inline-block mt-2">+15% respecto a ayer</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Transacciones</span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-4">84</p>
          <span className="text-xs text-sky-400 font-semibold inline-block mt-2">Promedio $148.21 / ticket</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Clientes Atendidos</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-4">62</p>
          <span className="text-xs text-purple-400 font-semibold inline-block mt-2">12 Clientes frecuentes</span>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Margen Promedio</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 mt-4">38.5%</p>
          <span className="text-xs text-amber-400 font-semibold inline-block mt-2">Estable</span>
        </div>
      </div>
    </div>
  );
};
