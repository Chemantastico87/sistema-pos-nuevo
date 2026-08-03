import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Archive, ArrowUpRight, ArrowDownRight, RefreshCw, Plus, Search, Filter, History, Calendar, MapPin, Tag } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';
import { useAuthStore } from '../core/store/authStore';
import { useTranslation } from '../core/store/languageStore';

export const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [kpis, setKpis] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kpis' | 'products' | 'movements'>('products');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal Nuevo/Editar Producto State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [sku, setSku] = useState('');
  const [reference, setReference] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [minStock, setMinStock] = useState('5');
  const [maxStock, setMaxStock] = useState('100');
  const [supplier, setSupplier] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // Modal Ajuste de Stock State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [newStockVal, setNewStockVal] = useState('');
  const [movementType, setMovementType] = useState('Ajuste');
  const [adjustReason, setAdjustReason] = useState('');

  const currency = useAuthStore((s) => s.user?.currency || 'EUR');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setIsLoading(true);
    try {
      const [kRes, pRes, mRes]: any[] = await Promise.all([
        apiClient.get('/inventory/kpis'),
        apiClient.get('/products'),
        apiClient.get('/inventory/movements'),
      ]);
      setKpis(kRes);
      setProducts(pRes || []);
      setMovements(mRes || []);
    } catch (err) {
      console.error('Error cargando inventario:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const floatVal = (v: any): number => {
    if (v === null || v === undefined) return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        barcode,
        sku,
        reference,
        cost_price: costPrice.trim() !== '' ? parseFloat(costPrice) : null,
        price: parseFloat(salePrice) || 0,
        stock: parseFloat(stock) || 0,
        min_stock: parseFloat(minStock) || 0,
        max_stock: parseFloat(maxStock) || 100,
        supplier,
        brand,
        location,
        lot_number: lotNumber,
        expiration_date: expirationDate,
      };

      if (editingProduct) {
        await apiClient.put(`/products/${editingProduct.id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }

      setShowProductModal(false);
      resetProductForm();
      fetchInventoryData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al guardar producto.');
    }
  };

  const handleSaveStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/inventory/adjust', null, {
        params: {
          product_id: adjustProductId,
          new_stock: parseFloat(newStockVal) || 0,
          movement_type: movementType,
          reason: adjustReason,
        },
      });

      setShowAdjustModal(false);
      setAdjustProductId('');
      setNewStockVal('');
      setAdjustReason('');
      fetchInventoryData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al ajustar stock.');
    }
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode || '');
    setSku(p.sku || '');
    setReference(p.reference || '');
    setCostPrice(p.cost_price !== null && p.cost_price !== undefined ? p.cost_price.toString() : '');
    setSalePrice(p.price?.toString() || '0');
    setStock(p.stock?.toString() || '0');
    setMinStock(p.min_stock?.toString() || '5');
    setMaxStock(p.max_stock?.toString() || '100');
    setSupplier(p.supplier || '');
    setBrand(p.brand || '');
    setLocation(p.location || '');
    setLotNumber(p.lot_number || '');
    setExpirationDate(p.expiration_date || '');
    setShowProductModal(true);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setName('');
    setBarcode('');
    setSku('');
    setReference('');
    setCostPrice('');
    setSalePrice('');
    setStock('');
    setMinStock('5');
    setMaxStock('100');
    setSupplier('');
    setBrand('');
    setLocation('');
    setLotNumber('');
    setExpirationDate('');
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search)) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            {t('inventory_title')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('inventory_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetProductForm(); setShowProductModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('add_product')}</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Inventario */}
      <div className="grid grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('inventory_val')}</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {currency} {kpis?.total_inventory_value?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">{t('cost_stored')}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('potential_profit')}</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {currency} {kpis?.potential_profit?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">{t('estimated_margin')}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('out_of_stock')}</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">{kpis?.out_of_stock_count || 0}</span>
          <span className="text-[10px] text-rose-600 font-medium">{t('requires_replenishment')}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('low_stock')}</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">{kpis?.low_stock_count || 0}</span>
          <span className="text-[10px] text-amber-600 font-medium">{t('preventive_alert')}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('no_movement')}</span>
          <span className="text-xl font-black text-slate-700 mt-1 block">{kpis?.no_movement_count || 0}</span>
          <span className="text-[10px] text-slate-500 font-medium">{t('inactive_stock')}</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 block uppercase">{t('total_items')}</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">{kpis?.total_products || 0}</span>
          <span className="text-[10px] text-indigo-600 font-medium">{t('in_catalog')}</span>
        </div>
      </div>

      {/* Pestañas de Vista */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('product_catalog_tab')} ({filteredProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('movements_history_tab')} ({movements.length})</span>
        </button>
      </div>

      {/* TAB 1: LISTADO DE PRODUCTOS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search_inventory_ph')}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">{t('th_product')}</th>
                  <th className="p-3">{t('th_sku_barcode')}</th>
                  <th className="p-3 text-right">{t('th_purchase_price')}</th>
                  <th className="p-3 text-right">{t('th_sale_price')}</th>
                  <th className="p-3 text-right">{t('th_margin_profit')}</th>
                  <th className="p-3 text-right">{t('th_current_stock')}</th>
                  <th className="p-3">{t('th_location_lot')}</th>
                  <th className="p-3 text-right">{t('th_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const hasCost = p.cost_price !== null && p.cost_price !== undefined && !isNaN(p.cost_price);
                  const cost = hasCost ? floatVal(p.cost_price) : null;
                  const price = floatVal(p.price);
                  const profit = hasCost && cost !== null ? price - cost : null;
                  const margin = hasCost && cost !== null && price > 0 ? (profit! / price) * 100 : null;
                  const currentStock = floatVal(p.stock);
                  const isLow = currentStock <= floatVal(p.min_stock);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        <div>{p.name}</div>
                        {p.brand && <span className="text-[10px] text-slate-400 font-medium block">Marca: {p.brand}</span>}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        <div>{p.barcode || '-'}</div>
                        <div className="text-[10px] text-slate-400">{p.sku ? `SKU: ${p.sku}` : ''}</div>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {hasCost && cost !== null ? (
                          `${currency} ${cost.toFixed(2)}`
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                            Sin coste registrado
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900">{currency} {price.toFixed(2)}</td>
                      <td className="p-3 text-right">
                        {hasCost && profit !== null && margin !== null ? (
                          <>
                            <span className="text-emerald-600 font-bold block">{currency} {profit.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 block">{margin.toFixed(1)}% margen</span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-block ${
                          currentStock <= 0
                            ? 'bg-rose-100 text-rose-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {currentStock} {p.unit || 'uds'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        <div>{p.location ? `Ubicación: ${p.location}` : '-'}</div>
                        <div>{p.lot_number ? `Lote: ${p.lot_number}` : ''}</div>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => { setAdjustProductId(p.id); setNewStockVal(currentStock.toString()); setShowAdjustModal(true); }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all"
                        >
                          Ajustar Stock
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-all"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-400">
                      {t('no_products_inventory')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIAL DE MOVIMIENTOS */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Tipo Movimiento</th>
                  <th className="p-3">ID Producto</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 text-right">Antes</th>
                  <th className="p-3 text-right">Después</th>
                  <th className="p-3">Motivo / Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                        m.movement_type === 'Venta'
                          ? 'bg-indigo-50 text-indigo-700'
                          : m.movement_type === 'Entrada'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{m.product_id}</td>
                    <td className={`p-3 text-right font-bold ${floatVal(m.quantity) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {floatVal(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="p-3 text-right text-slate-500">{m.stock_before}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{m.stock_after}</td>
                    <td className="p-3 text-slate-600">{m.reason || '-'}</td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      No hay registros de movimientos en la bitácora de inventario.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col overflow-y-auto my-auto">
            <h3 className="text-lg font-bold text-slate-900 shrink-0">
              {editingProduct ? 'Editar Producto Comercial' : 'Alta de Nuevo Producto'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nombre comercial completo"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="EAN-13 / UPC"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="PROD-001"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Referencia</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="REF-INT-99"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Precio Compra (Opcional) ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Precio Venta PVP ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Máximo</label>
                  <input
                    type="number"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Proveedor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Nombre del distribuidor"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Marca comercial"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ubicación Almacén</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Pasillo 3, Estante B"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Lote</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    placeholder="LOT-2026-99"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha Caducidad</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md transition-all"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJUSTE DE STOCK */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ajuste Manual de Inventario</h3>
            <form onSubmit={handleSaveStockAdjust} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nuevo Stock Físico</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Movimiento</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="Ajuste">Ajuste por Recuento</option>
                  <option value="Entrada">Entrada de Mercancía</option>
                  <option value="Salida">Salida / Mermas</option>
                  <option value="Devolución">Devolución de Cliente</option>
                  <option value="Transferencia">Transferencia de Almacén</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Motivo / Observaciones</label>
                <textarea
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Describa la causa del ajuste de stock..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-800 outline-none h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Confirmar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function floatVal(val: any): number {
  return parseFloat(val || '0') || 0;
}
