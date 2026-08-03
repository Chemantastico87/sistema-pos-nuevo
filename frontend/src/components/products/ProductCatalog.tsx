import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, PlusCircle, Trash2, Edit3, Sparkles, AlertCircle } from 'lucide-react';

import { db, LocalProduct } from '../../core/db/dexieDB';
import { useSettingsStore } from '../../core/store/settingsStore';
import { useTranslation } from '../../core/store/languageStore';
import { SmartProductDiscoveryModal } from './SmartProductDiscoveryModal';

export const ProductCatalog: React.FC = () => {
  const { t } = useTranslation();
  const { formatMoney, currencySymbol } = useSettingsStore();
  const [products, setProducts] = useState<LocalProduct[]>([]);

  // Modales
  const [showSmartDiscovery, setShowSmartDiscovery] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProd, setEditingProd] = useState<LocalProduct | null>(null);
  const [deletingProd, setDeletingProd] = useState<LocalProduct | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');


  const generateRandomBarcode = () => {
    const randomEan = '770' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setBarcode(randomEan);
  };

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

    const barcodeVal = barcode.trim() || '770' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const parsedCost = cost.trim() !== '' ? parseFloat(cost) : null;

    const newProd: LocalProduct = {
      id: `prod_${Date.now()}`,
      company_id: 'c1',
      name,
      brand,
      category_id: category,
      price: parseFloat(price) || 0,
      cost_price: parsedCost,
      stock: parseFloat(stock) || 0,
      barcode: barcodeVal,
      sku: barcodeVal,
    };

    await db.products.add(newProd);
    setProducts((prev) => [...prev, newProd]);
    setName('');
    setBrand('');
    setCategory('General');
    setPrice('');
    setCost('');
    setStock('');
    setBarcode('');
    setShowAddModal(false);
  };


  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    // Buscar producto actual para comparar si el coste cambió
    const currentProd = await db.products.get(editingProd.id);
    const oldCost = currentProd?.cost_price;
    const newCost = editingProd.cost_price;

    await db.products.update(editingProd.id, {
      name: editingProd.name,
      price: editingProd.price,
      cost_price: newCost,
      stock: editingProd.stock,
    });

    // Registrar en Histórico de Costes si hubo cambio de costo
    if (oldCost !== newCost) {
      const now = new Date();
      await db.cost_history.add({
        product_id: editingProd.id,
        product_name: editingProd.name,
        previous_cost: oldCost ?? null,
        new_cost: newCost ?? 0,
        user: 'Admin',
        date_time: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        reason: 'Actualización manual desde Ficha de Producto',
      });
    }

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">{t('products_title')}</h1>
          <p className="text-slate-500 text-sm">{t('products_subtitle')}</p>
        </div>
        <button
          onClick={() => setShowSmartDiscovery(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> {t('add_product')} <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono font-black">&lt;10s</span>
        </button>
      </div>

      {/* VENDIX Smart Product Discovery Engine Modal */}
      {showSmartDiscovery && (
        <SmartProductDiscoveryModal
          onClose={() => setShowSmartDiscovery(false)}
          onProductCreated={(newProd) => {
            setProducts((prev) => [...prev, newProd]);
          }}
        />
      )}

      {/* Modal Crear */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-y-auto my-auto">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">{t('add_product')}</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('product_name')}</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Café Capuchino 300ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-medium"
                />
              </div>

              {/* CÓDIGO DE BARRAS / ESCÁNER */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">{t('barcode_label')}</label>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                  >
                    ⚡ {t('generate_barcode')}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder={t('barcode_ph')}
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Comercial"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. General"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio de venta * ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3.50 *"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-indigo-500 rounded-xl px-3 py-2 text-slate-800 font-extrabold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio de compra (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock inicial (Opcional)</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>
              </div>

              {cost.trim() === '' && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Este producto aún no tiene precio de compra. Puedes añadirlo más adelante para obtener estadísticas de beneficio.</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer">
                  {t('cancel')}
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-700 cursor-pointer">
                  Crear producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editingProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-y-auto my-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProd.price}
                    onChange={(e) => setEditingProd({ ...editingProd, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Sin coste"
                    value={editingProd.cost_price ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditingProd({
                        ...editingProd,
                        cost_price: val.trim() !== '' ? parseFloat(val) : null,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={editingProd.stock}
                    onChange={(e) => setEditingProd({ ...editingProd, stock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-bold text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingProd(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 cursor-pointer">
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
          <h3 className="font-bold text-slate-800 text-sm">{t('no_products_catalog')}</h3>
          <p className="text-xs text-slate-500">{t('add_first_product')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">{t('th_product')}</th>
                <th className="px-6 py-4">{t('th_sale_price')}</th>
                <th className="px-6 py-4">{t('th_purchase_price')}</th>
                <th className="px-6 py-4">{t('th_margin_profit')}</th>
                <th className="px-6 py-4">{t('th_current_stock')}</th>
                <th className="px-6 py-4 text-right">{t('th_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const hasCost = p.cost_price !== null && p.cost_price !== undefined && !isNaN(p.cost_price);
                const profit = hasCost ? p.price - (p.cost_price || 0) : null;
                const margin = hasCost && p.price > 0 ? (profit! / p.price) * 100 : null;

                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>
                        <span className="block">{p.name}</span>
                        {p.barcode && <span className="text-[10px] font-mono text-slate-400">EAN: {p.barcode}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-600">{formatMoney(p.price)}</td>
                    <td className="px-6 py-4">
                      {hasCost ? (
                        <span className="font-bold text-slate-800">{formatMoney(p.cost_price!)}</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] inline-flex items-center gap-1">
                          Sin coste registrado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasCost && margin !== null ? (
                        <span className={`font-bold ${margin > 20 ? 'text-emerald-600' : 'text-slate-600'}`}>
                          {margin.toFixed(1)}% ({formatMoney(profit!)})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{p.stock} u.</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingProd(p)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                          title="Editar Producto & Precio de Compra"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button
                          onClick={() => setDeletingProd(p)}
                          className="p-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                          title="Eliminar Producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
