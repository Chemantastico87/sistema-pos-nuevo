import React from 'react';
import { ShieldCheck, History } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const logs = [
    { id: 'audit_001', action: 'SaleCreated', entity: 'Sale', entity_id: 'sale_98765', user: 'admin', date: '2026-07-29 16:45:00' },
    { id: 'audit_002', action: 'PriceUpdated', entity: 'Product', entity_id: 'prod_101', user: 'admin', date: '2026-07-29 14:20:00' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Registros de Auditoría & Diff Tracking</h1>
        <p className="text-slate-400 text-sm">Historial inmutable de acciones transaccionales del sistema</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Fecha y Hora</th>
              <th className="px-6 py-4">Acción</th>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4">ID Referencia</th>
              <th className="px-6 py-4">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-slate-900/40">
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{l.date}</td>
                <td className="px-6 py-4 font-semibold text-sky-400">{l.action}</td>
                <td className="px-6 py-4 text-slate-300">{l.entity}</td>
                <td className="px-6 py-4 font-mono text-xs text-purple-400">{l.entity_id}</td>
                <td className="px-6 py-4 text-slate-400">{l.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
