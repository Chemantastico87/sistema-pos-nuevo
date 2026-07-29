import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, PlusCircle, Trash2, Edit3 } from 'lucide-react';
import { db, LocalProduct } from '../../core/db/dexieDB';
import { useSettingsStore } from '../../core/store/settingsStore';

export const ProductCatalog: React.FC = () => {
  const { formatMoney, currencySymbol } = useSettingsStore();
  const [products, setProducts] = useState<LocalProduct[]>([]);

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProd, setEditingProd] = useState<LocalProduct | null>(null);
  const [deletingProd, setDeletingProd] = useState<LocalProduct | null>(null);

  // Form states
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    await db.products.update(editingProd.id, {
      name: editingProd.name,
      price: editingProd.price,
      cost_price: editingProd.cost_price,
      stock: editingProd.stock,
    });

    setProducts(await db.products.toArray());
    setEditingProd(null);
  };

  const handleDelete = async () => {
    if (!deletingProd) return;
    await db.products.delete(deletingProd.id);
    setProducts(await db.products.toArray());
    setDeletingProd(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo General de Productos</h1>
          <p className="text-slate-500 text-sm">Gestión completa de productos, precios y control de inventario</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/30">
          <Plus className="w-4 h-4" /> + Crear Nuevo Producto
        </button>
      </div>

      {/* Modal Crear */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Crear Producto</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Café Capuchino 300ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3.50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Editar Producto</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingProd.name}
                  onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProd.price}
                    onChange={(e) => setEditingProd({ ...editingProd, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProd.stock}
                    onChange={(e) => setEditingProd({ ...editingProd, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingProd(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deletingProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">¿Eliminar Producto?</h3>
              <p className="text-xs text-slate-500">
                ¿Confirmas eliminar <span className="font-bold text-slate-800">{deletingProd.name}</span>? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeletingProd(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs">Cancelar</button>
              <button onClick={handleDelete} className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:bg-rose-700">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Productos */}
      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No hay productos en el catálogo</h3>
          <p className="text-xs text-slate-500">Agrega tu primer producto haciendo clic en 'Nuevo Producto'.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Precio Venta</th>
                <th className="px-6 py-4">Stock Disponible</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 font-black text-indigo-600">{formatMoney(p.price)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-600">{p.stock} u.</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProd(p)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 flex items-center gap-1"
                        title="Editar Producto"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button
                        onClick={() => setDeletingProd(p)}
                        className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
