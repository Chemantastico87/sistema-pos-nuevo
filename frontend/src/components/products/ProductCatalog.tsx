import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, PlusCircle } from 'lucide-react';
import { db, LocalProduct } from '../../core/db/dexieDB';

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    const load = async () => {
      const items = await db.products.toArray();
      setProducts(items);
    };
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const prod: LocalProduct = {
      id: `prod_${Date.now()}`,
      company_id: 'comp_demo',
      name,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(cost) || 0,
      stock: parseFloat(stock) || 0,
    };

    await db.products.add(prod);
    setProducts((prev) => [...prev, prod]);
    setName('');
    setPrice('');
    setCost('');
    setStock('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p className="text-slate-500 text-sm">Gestión de productos de la tienda</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Crear Producto</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2 rounded-xl border border-slate-200">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2 rounded-xl bg-indigo-600 text-white font-bold">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No hay productos guardados</h3>
          <p className="text-xs text-slate-500">Agrega tu primer producto haciendo clic en 'Nuevo Producto'.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Producto</th>
                <th className="px-6 py-3.5">Precio Venta</th>
                <th className="px-6 py-3.5">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-3.5 font-extrabold text-indigo-600">${p.price.toLocaleString('es-CO')}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-600">{p.stock} u.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
