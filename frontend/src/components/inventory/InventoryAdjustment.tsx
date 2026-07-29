import React from 'react';
import { Warehouse, RefreshCw } from 'lucide-react';

export const InventoryAdjustment: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Ajustes de Inventario</h1>
        <p className="text-slate-400 text-sm">Entradas, salidas y conciliación de stock en tiempo real</p>
      </div>

      <div className="glass-card p-6 rounded-2xl max-w-xl space-y-4">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-sky-400" /> Registrar Ajuste de Stock
        </h3>
        <div>
          <label className="text-xs text-slate-400 block mb-1">ID Producto</label>
          <input type="text" placeholder="prod_101" className="input-field w-full" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Nuevo Stock</label>
          <input type="number" placeholder="150" className="input-field w-full" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Motivo del Ajuste</label>
          <input type="text" placeholder="Recepción de proveedor / Conteo físico" className="input-field w-full" />
        </div>
        <button className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
          <RefreshCw className="w-4 h-4" /> Guardar Ajuste
        </button>
      </div>
    </div>
  );
};
