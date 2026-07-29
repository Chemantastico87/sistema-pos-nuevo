import React from 'react';
import { Receipt, Printer } from 'lucide-react';

export const TicketDesigner: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Diseñador Visual de Tickets ESC/POS</h1>
        <p className="text-slate-400 text-sm">Personalización de encabezado, pie de página e impresión directa WebDirect</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h3 className="font-semibold text-slate-200 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-sky-400" /> Configuración de Plantilla
          </h3>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Encabezado del Ticket</label>
            <textarea rows={3} defaultValue="¡Gracias por su preferencia!&#10;POS SAAS DEMO STORE" className="input-field w-full" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Pie de Página</label>
            <textarea rows={2} defaultValue="Conserve su ticket para cambios o devoluciones." className="input-field w-full" />
          </div>
          <button className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            <Printer className="w-4 h-4" /> Probar Impresión WebDirect USB
          </button>
        </div>
      </div>
    </div>
  );
};
