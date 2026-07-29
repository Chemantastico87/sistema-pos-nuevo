import React, { useState } from 'react';
import { Plus, Search, Package } from 'lucide-react';

export const ProductCatalog: React.FC = () => {
  const [products] = useState([
    { id: 'prod_101', barcode: '7501055300078', name: 'Refresco de Cola 600ml', price: 18.5, cost: 12.0, stock: 150 },
    { id: 'prod_102', barcode: '7501055300085', name: 'Agua Mineral 1L', price: 15.0, cost: 8.5, stock: 200 },
    { id: 'prod_103', barcode: '7501000123456', name: 'Papas Fritas Sal 45g', price: 22.0, cost: 14.0, stock: 80 },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Catálogo de Productos</h1>
          <p className="text-slate-400 text-sm">Gestión de inventarios, códigos de barras y precios</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Precio Venta</th>
              <th className="px-6 py-4">Costo</th>
              <th className="px-6 py-4">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-slate-900/40">
                <td className="px-6 py-4 font-mono text-xs text-sky-400">{prod.barcode}</td>
                <td className="px-6 py-4 font-medium text-slate-200">{prod.name}</td>
                <td className="px-6 py-4 font-bold text-emerald-400">${prod.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-400">${prod.cost.toFixed(2)}</td>
                <td className="px-6 py-4 font-semibold text-slate-200">{prod.stock} u.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
