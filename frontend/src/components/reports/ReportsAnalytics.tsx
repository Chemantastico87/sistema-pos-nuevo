import React from 'react';
import { BarChart3, Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export const ReportsAnalytics: React.FC = () => {
  const exportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Fecha,Total,Metodo,Factura\n2026-07-29,14280,Efectivo,INV-100201\n2026-07-29,32500,Tarjeta,INV-100202';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reporte_ventas_pos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes de Ventas & Analíticas</h1>
          <p className="text-slate-500 text-sm">Resumen de ingresos, productos más vendidos y exportación de datos</p>
        </div>
        <button onClick={exportCSV} className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/30">
          <Download className="w-4 h-4" /> Exportar Reporte (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Ventas del Día</span>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">$1,450,200</p>
          <p className="text-[11px] font-bold text-emerald-600">+18% respecto a la semana anterior</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Tickets Emitidos</span>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">142</p>
          <p className="text-[11px] font-bold text-indigo-600">Promedio $10,212 por ticket</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Utilidad Bruta Estimada</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">38.4%</p>
          <p className="text-[11px] font-bold text-purple-600">Margen promedio saludable</p>
        </div>
      </div>
    </div>
  );
};
