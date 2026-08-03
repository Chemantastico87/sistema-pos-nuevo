import React from 'react';
import { Sparkles, Zap, CheckCircle2, Server, Layers, ShieldCheck, Activity, Award } from 'lucide-react';

export const SmartDiscoveryMetrics: React.FC = () => {
  const metrics = [
    { title: 'Productos Descubiertos', value: '14,892', change: '+18% este mes', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Tasa de Auto-Creación (<10s)', value: '96.4%', change: 'Meta: 95.0%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Latencia Media de Búsqueda', value: '142 ms', change: 'Cascada 5 niveles', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Catálogo Comunitario Compartido', value: '8,420 EANs', change: 'Comunidad VENDIX', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const providers = [
    { name: 'Open Food Facts API', hits: '6,420', latency: '120ms', accuracy: '98.2%', status: 'Excelente' },
    { name: 'UPCItemDB Registry', hits: '4,150', latency: '180ms', accuracy: '96.5%', status: 'Excelente' },
    { name: 'VENDIX Global Community', hits: '3,110', latency: '15ms', accuracy: '99.8%', status: 'Ultra-Rápido' },
    { name: 'Smart AI Fallback Engine', hits: '1,212', latency: '210ms', accuracy: '94.0%', status: 'Activo' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Telemetría SuperAdmin: Smart Product Discovery Engine
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Rendimiento del motor de descubrimiento automático, tiempos de respuesta y precisión por proveedor.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{m.title}</span>
                <div className={`w-8 h-8 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 font-heading">{m.value}</p>
              <p className="text-[11px] font-bold text-emerald-600">{m.change}</p>
            </div>
          );
        })}
      </div>

      {/* Relleno de Tabla de Proveedores en Cascada */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" /> Rendimiento por Proveedor de Cascada
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="pb-3">Proveedor / Fuente</th>
                <th className="pb-3">Impactos Exitosos</th>
                <th className="pb-3">Latencia Media</th>
                <th className="pb-3">Precisión</th>
                <th className="pb-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {providers.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3 font-mono font-bold text-indigo-600">{p.hits}</td>
                  <td className="py-3 font-mono text-emerald-600 font-bold">{p.latency}</td>
                  <td className="py-3 font-bold text-slate-900">{p.accuracy}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[10px]">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
