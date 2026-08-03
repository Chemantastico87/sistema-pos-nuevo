import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, 
  User, Printer, CheckCircle2, QrCode, Grid, Layers, RefreshCw, Search,
  Coffee, Cookie, Milk, ShoppingBag, Sparkles, Box, PlusCircle, Package, Receipt, Check, Edit3, AlertCircle
} from 'lucide-react';

import { usePOSStore } from '../../core/store/posStore';
import { useSettingsStore } from '../../core/store/settingsStore';
import { useCashStore } from '../../core/store/cashStore';
import { useKeyboardShortcuts } from '../../core/hooks/useKeyboardShortcuts';
import { ThermalPrinterService } from '../hardware/ThermalPrinterService';
import { db, LocalProduct } from '../../core/db/dexieDB';

const STARTER_PRODUCTS: LocalProduct[] = [
  { id: 'prod_1', company_id: 'c1', name: 'Agua Mineral 600ml', price: 1.20, cost_price: 0.70, stock: 150, category_id: 'Bebidas' },
  { id: 'prod_2', company_id: 'c1', name: 'Coca Cola 600ml', price: 2.50, cost_price: 1.80, stock: 85, category_id: 'Bebidas' },
  { id: 'prod_3', company_id: 'c1', name: 'Papas Rizadas Sal 45g', price: 3.20, cost_price: 2.10, stock: 60, category_id: 'Snacks' },
  { id: 'prod_4', company_id: 'c1', name: 'Leche Entera 1L', price: 3.80, cost_price: 2.90, stock: 40, category_id: 'Lácteos' },
  { id: 'prod_5', company_id: 'c1', name: 'Arroz Blanco 1kg', price: 4.20, cost_price: 3.10, stock: 70, category_id: 'Abarrotes' },
  { id: 'prod_6', company_id: 'c1', name: 'Aceite Vegetal 1L', price: 6.50, cost_price: 4.80, stock: 30, category_id: 'Abarrotes' },
  { id: 'prod_7', company_id: 'c1', name: 'Jabón en Polvo 1kg', price: 5.90, cost_price: 4.10, stock: 25, category_id: 'Limpieza' },
  { id: 'prod_8', company_id: 'c1', name: 'Pan de Molde Blanco', price: 2.90, cost_price: 1.90, stock: 45, category_id: 'Snacks' },
];

import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../core/store/languageStore';
import { SmartProductDiscoveryModal } from '../products/SmartProductDiscoveryModal';

export const POSContainer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { cart, selectedCustomer, discount, paymentMethod, searchQuery, setSearchQuery, addToCart, removeFromCart, updateQuantity, setDiscount, setPaymentMethod, clearCart } = usePOSStore();
  const { formatMoney, currencySymbol, taxRate } = useSettingsStore();
  const { addSaleRecord } = useCashStore();

  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleReceipt, setLastSaleReceipt] = useState<any | null>(null);

  // VENDIX Smart Product Discovery Modal State
  const [showSmartDiscovery, setShowSmartDiscovery] = useState(false);
  const [discoveryBarcode, setDiscoveryBarcode] = useState('');

  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCost, setNewProductCost] = useState('');
  const [newProductStock, setNewProductStock] = useState('50');
  const [newProductBarcode, setNewProductBarcode] = useState('');


  const [editingProd, setEditingProd] = useState<LocalProduct | null>(null);
  const [deletingProd, setDeletingProd] = useState<LocalProduct | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const generateRandomBarcode = () => {
    const randomEan = '770' + Math.floor(100000000 + Math.random() * 900000000).toString();
    setNewProductBarcode(randomEan);
  };

  useEffect(() => {
    const initProducts = async () => {
      const localProds = await db.products.toArray();
      setProducts(localProds);
    };
    initProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;

    const barcodeVal = newProductBarcode.trim() || '770' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const parsedCost = newProductCost.trim() !== '' ? parseFloat(newProductCost) : null;

    const newProd: LocalProduct = {
      id: `prod_${Date.now()}`,
      company_id: 'comp_demo',
      name: newProductName,
      brand: newProductBrand || 'Comercial',
      price: parseFloat(newProductPrice) || 0,
      cost_price: parsedCost,
      stock: parseFloat(newProductStock) || 0,
      barcode: barcodeVal,
      sku: barcodeVal,
      category_id: selectedCategory !== 'Todos' ? selectedCategory : 'General',
    };

    await db.products.add(newProd);
    setProducts((prev) => [...prev, newProd]);
    setNewProductName('');
    setNewProductBrand('');
    setNewProductPrice('');
    setNewProductCost('');
    setNewProductBarcode('');
    setShowAddModal(false);
  };


  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;

    await db.products.update(editingProd.id, {
      name: editingProd.name,
      price: editingProd.price,
      stock: editingProd.stock,
    });

    setProducts(await db.products.toArray());
    setEditingProd(null);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProd) return;
    await db.products.delete(deletingProd.id);
    setProducts(await db.products.toArray());
    setDeletingProd(null);
  };

  const handleChangeCartItemPrice = (product_id: string, currentPrice: number) => {
    const p = prompt(`Cambiar precio unitario (${currencySymbol}):`, currentPrice.toString());
    if (p !== null && !isNaN(parseFloat(p))) {
      const newP = parseFloat(p);
      const item = cart.find(c => c.product_id === product_id);
      if (item) {
        removeFromCart(product_id);
        addToCart({ ...item, unit_price: newP });
      }
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = Math.max(0, subtotal - discount + tax);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toLocaleString('es-CO');

    const receiptData = {
      invoiceNumber,
      date: now,
      items: [...cart],
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      customer: customerSearch || 'Cliente General',
    };

    try {
      // Registrar venta en CashStore para el control diario de caja
      addSaleRecord({
        id: `sale_${Date.now()}`,
        invoiceNumber,
        date: now,
        customer: customerSearch || 'Cliente General',
        total,
        paymentMethod,
        items: cart.map(c => ({ product_id: c.product_id, product_name: c.product_name, quantity: c.quantity, unit_price: c.unit_price })),
        status: 'completed',
      });

      // Impresión de comprobante térmico ESC/POS
      const buffer = ThermalPrinterService.generateESCPOSBuffer({
        title: 'NEXUS POS STORE',
        invoice: invoiceNumber,
        items: cart.map((c) => ({ name: c.product_name, qty: c.quantity, price: c.unit_price })),
        total,
      });
      ThermalPrinterService.printDirectUSB(buffer).catch(() => {});

      // Deducción de stock local en IndexedDB
      for (const item of cart) {
        const prod = products.find((p) => p.id === item.product_id);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db.products.update(prod.id, { stock: newStock });
        }
      }
      setProducts(await db.products.toArray());

      setLastSaleReceipt(receiptData);
      clearCart();
    } catch (err) {
      clearCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const [scanNotice, setScanNotice] = useState<string | null>(null);

  const scanBufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);

  const playScanBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio fallback
    }
  };

  const handleScanBarcode = (rawCode: string): boolean => {
    const code = rawCode.trim();
    if (!code) return false;

    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === code.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === code.toLowerCase()) ||
        p.id.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      playScanBeep();
      addToCart({
        product_id: matched.id,
        product_name: matched.name,
        unit_price: matched.price,
        quantity: 1,
        tax_rate: matched.vat_rate || 21,
      });
      setScanNotice(`⚡ ¡Producto escaneado y agregado!: ${matched.name} (${formatMoney(matched.price)})`);
      setTimeout(() => setScanNotice(null), 3500);
      setSearchQuery('');
      return true;
    } else if (code.length >= 6 && /^[a-zA-Z0-9_-]+$/.test(code)) {
      playScanBeep();
      setDiscoveryBarcode(code);
      setShowSmartDiscovery(true);
      setSearchQuery('');
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (showSmartDiscovery || showAddModal || editingProd || deletingProd || lastSaleReceipt) {
        return;
      }

      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === 'Enter') {
        const buffer = scanBufferRef.current.trim();
        const currentSearch = searchQuery.trim();
        const codeToTest = buffer || (isInputFocused ? currentSearch : '');

        if (codeToTest.length >= 3) {
          const handled = handleScanBarcode(codeToTest);
          if (handled) {
            e.preventDefault();
            e.stopPropagation();
            scanBufferRef.current = '';
            return;
          }
        }
        scanBufferRef.current = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (timeDiff > 80) {
          scanBufferRef.current = e.key;
        } else {
          scanBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [products, searchQuery, showSmartDiscovery, showAddModal, editingProd, deletingProd, lastSaleReceipt]);

  // Atajos F1-F8 + Enter 100% Funcionales
  useKeyboardShortcuts({
    onF1Search: () => {
      if (cart.length > 0) clearCart();
      else searchInputRef.current?.focus();
    },
    onF2Customer: () => searchInputRef.current?.focus(),
    onF3Scan: () => {
      const code = prompt('Ingresa o escanea el código de barras manualmente:');
      if (code) handleScanBarcode(code);
    },
    onF4Customer: () => handleCheckout(),
    onF5Suspend: () => clearCart(),
    onF7Discount: () => {
      const d = prompt(`Monto descuento (${currencySymbol}):`, discount.toString());
      if (d !== null) setDiscount(parseFloat(d) || 0);
    },
    onF8Drawer: () => alert('Caja registradora abierta automáticamente.'),
    onEnterCheckout: () => handleCheckout(),
  });

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'Todos' && p.category_id !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-5 overflow-hidden p-1 relative">
      {/* Toast Notificación de Escaneo Exitoso */}
      {scanNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-extrabold text-sm flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{scanNotice}</span>
        </div>
      )}
      {/* Modal Ticket de Venta Exitoso */}
      {lastSaleReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl animate-in fade-in">
            <div className="text-center space-y-2 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900">¡Venta Registrada!</h3>
              <p className="text-xs font-mono text-indigo-600 font-bold">{lastSaleReceipt.invoiceNumber}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-medium">
                <span>Cliente:</span>
                <span>{lastSaleReceipt.customer}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Método de Pago:</span>
                <span className="capitalize font-bold text-slate-900">{lastSaleReceipt.paymentMethod}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                {lastSaleReceipt.items.map((it: any) => (
                  <div key={it.product_id} className="flex justify-between text-[11px]">
                    <span>{it.quantity}x {it.product_name}</span>
                    <span className="font-semibold">{formatMoney(it.quantity * it.unit_price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
                <span>TOTAL:</span>
                <span className="text-indigo-600 font-black">{formatMoney(lastSaleReceipt.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setLastSaleReceipt(null)}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-700"
              >
                Siguiente Venta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENDIX Smart Product Discovery Modal Engine */}
      {showSmartDiscovery && (
        <SmartProductDiscoveryModal
          initialBarcode={discoveryBarcode}
          onClose={() => {
            setShowSmartDiscovery(false);
            setDiscoveryBarcode('');
          }}
          onProductCreated={(newProd) => {
            setProducts((prev) => [...prev, newProd]);
            addToCart({
              product_id: newProd.id,
              product_name: newProd.name,
              unit_price: newProd.price,
              quantity: 1,
              tax_rate: newProd.vat_rate || 21,
            });
          }}
        />
      )}

      {/* Modal Crear Nuevo Producto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] flex flex-col space-y-4 shadow-2xl overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" /> Crear Producto
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{t('product_name')}</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Café Capuchino 300ml"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-medium"
                />
              </div>

              {/* CAMPO DE CÓDIGO DE BARRAS CON ESCÁNER & GENERADOR EAN-13 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t('barcode_label')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                  >
                    ⚡ {t('generate_barcode')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('barcode_ph')}
                    value={newProductBarcode}
                    onChange={(e) => setNewProductBarcode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-20 py-2 text-slate-800 outline-none font-mono font-bold"
                  />
                  <div className="absolute right-1 top-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => alert(t('scan_mode_active'))}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                      title="Apunte su pistola lectora de código de barras"
                    >
                      <QrCode className="w-3 h-3" /> {t('scan_btn')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Comercial"
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <input
                    type="text"
                    disabled
                    value={selectedCategory !== 'Todos' ? selectedCategory : 'General'}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-600 outline-none font-medium"
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
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-indigo-500 rounded-xl px-3 py-2 text-slate-800 font-extrabold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio de compra (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Opcional"
                    value={newProductCost}
                    onChange={(e) => setNewProductCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock inicial (Opcional)</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none font-bold"
                  />
                </div>
              </div>

              {newProductCost.trim() === '' && (
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
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Producto */}
      {editingProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" /> Editar Producto
              </h3>
              <button onClick={() => setEditingProd(null)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
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
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingProd(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar Producto */}
      {deletingProd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">¿Eliminar Producto?</h3>
              <p className="text-xs text-slate-500">
                ¿Confirmas eliminar <span className="font-bold text-slate-800">{deletingProd.name}</span>? Se borrará definitivamente de la tienda.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setDeletingProd(null)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs">Cancelar</button>
              <button onClick={handleDeleteProduct} className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:bg-rose-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Columna Izquierda: Catálogo & Productos */}
      <div className="flex-1 flex flex-col justify-between gap-4 overflow-hidden">
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Top Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCategory('Todos')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30"
              >
                {t('all_products')}
              </button>
              <button
                onClick={() => setShowSmartDiscovery(true)}
                className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-purple-500 flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> {t('add_product')} <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-mono font-black">&lt;10s</span>
              </button>

              <button
                onClick={() => navigate('/sales')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5" /> {t('daily_sales_btn')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 cursor-pointer hover:bg-slate-50">
                <Grid className="w-4 h-4" />
              </div>
              <div
                onClick={() => alert('Modo lector de código de barras activo. Apunte su escáner.')}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('scan_btn')}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">F3</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'Todos', label: t('cat_all'), icon: Layers },
              { id: 'Bebidas', label: t('cat_drinks'), icon: Coffee },
              { id: 'Snacks', label: t('cat_snacks'), icon: Cookie },
              { id: 'Lácteos', label: t('cat_dairy'), icon: Milk },
              { id: 'Abarrotes', label: t('cat_groceries'), icon: ShoppingBag },
              { id: 'Limpieza', label: t('cat_cleaning'), icon: Box },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm font-bold ring-2 ring-indigo-600/10'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group relative"
              >
                <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProd(p);
                    }}
                    className="p-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                    title="Editar Producto"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingProd(p);
                    }}
                    className="p-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                    title="Eliminar Producto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div
                  onClick={() =>
                    addToCart({
                      product_id: p.id,
                      product_name: p.name,
                      quantity: 1,
                      unit_price: p.price,
                    })
                  }
                  className="space-y-2"
                >
                  <div className="h-24 flex items-center justify-center mb-1 overflow-hidden rounded-xl bg-slate-50 group-hover:scale-105 transition-transform">
                    <Package className="w-10 h-10 text-indigo-400 opacity-60" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-base font-extrabold text-slate-900">{formatMoney(p.price)}</p>
                    <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Toolbar con Atajos Interactivos F1-F8 + Enter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <button onClick={() => clearCart()} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>{t('new_sale')}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F1</span>
            </button>
            <button onClick={() => searchInputRef.current?.focus()} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>{t('search_product')}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F2</span>
            </button>
            <button onClick={() => alert('Modo escáner activo. Apunte su lector de código de barras.')} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>{t('scan')}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F3</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const d = prompt(`Monto descuento (${currencySymbol}):`, discount.toString());
              if (d !== null) setDiscount(parseFloat(d) || 0);
            }} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>{t('discount')}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F7</span>
            </button>
            <button onClick={() => alert('Caja registradora abierta automáticamente.')} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer">
              <span>{t('open_register')}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F8</span>
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Ticket de Venta */}
      <div className="w-[360px] bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm shrink-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-extrabold text-base text-slate-900">{t('cart_title')}</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => clearCart()} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Vaciar Ticket">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase px-1">
            <span className="col-span-5">{t('product_name')}</span>
            <span className="col-span-2 text-center">Cant.</span>
            <span className="col-span-2 text-right">{t('price')}</span>
            <span className="col-span-3 text-right">{t('total')}</span>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-xs">{t('empty_cart')}</p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="grid grid-cols-12 items-center text-xs text-slate-800 py-1.5 border-b border-slate-100 hover:bg-slate-50 rounded-lg px-1">
                  <div className="col-span-5 font-semibold text-slate-800 truncate pr-1">
                    {item.product_name}
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-700">
                    {item.quantity}
                  </div>
                  <div
                    onClick={() => handleChangeCartItemPrice(item.product_id, item.unit_price)}
                    className="col-span-2 text-right font-bold text-indigo-600 cursor-pointer hover:underline"
                    title="Haz clic para cambiar precio"
                  >
                    {formatMoney(item.unit_price)}
                  </div>
                  <div className="col-span-3 text-right font-bold text-slate-900 flex items-center justify-end gap-1">
                    <span>{formatMoney(item.quantity * item.unit_price)}</span>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary & Checkout */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>{t('subtotal')}</span>
              <span className="font-semibold text-slate-800">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>{t('discount')}</span>
              <span className="font-semibold text-slate-800">{formatMoney(discount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>{t('taxes')} ({taxRate}%)</span>
              <span className="font-semibold text-slate-800">{formatMoney(tax)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-extrabold text-sm text-slate-900">{t('total')}</span>
              <span className="font-black text-2xl text-indigo-600">{formatMoney(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {t('cash_pay')}</span>
              <span className="text-[10px] opacity-80">F1</span>
            </button>

            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'card'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> {t('card_pay')}</span>
              <span className="text-[10px] opacity-80">F2</span>
            </button>

            <button
              onClick={() => setPaymentMethod('mixed')}
              className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'mixed'
                  ? 'bg-indigo-700 text-white shadow-md shadow-indigo-700/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {t('mixed_pay')}</span>
              <span className="text-[10px] opacity-80">F3</span>
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-base shadow-lg shadow-indigo-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <span>{isProcessing ? '...' : t('checkout_btn')}</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-bold">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
