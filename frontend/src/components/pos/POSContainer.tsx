import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Trash2, Plus, Minus, CreditCard, DollarSign, UserCheck, Printer, CheckCircle } from 'lucide-react';
import { usePOSStore } from '../../core/store/posStore';
import { useKeyboardShortcuts } from '../../core/hooks/useKeyboardShortcuts';
import { useLocalSearch } from '../../core/hooks/useLocalSearch';
import { apiClient } from '../../core/services/apiClient';
import { db, LocalProduct } from '../../core/db/dexieDB';
import { ThermalPrinterService } from '../hardware/ThermalPrinterService';

export const POSContainer: React.FC = () => {
  const { cart, selectedCustomer, discount, paymentMethod, addToCart, removeFromCart, updateQuantity, setDiscount, setPaymentMethod, clearCart } = usePOSStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<LocalProduct[]>([
    { id: 'prod_101', company_id: 'c1', name: 'Refresco de Cola 600ml', price: 18.5, cost_price: 12, stock: 150, barcode: '7501055300078' },
    { id: 'prod_102', company_id: 'c1', name: 'Agua Mineral 1L', price: 15.0, cost_price: 8.5, stock: 200, barcode: '7501055300085' },
    { id: 'prod_103', company_id: 'c1', name: 'Papas Fritas Sal 45g', price: 22.0, cost_price: 14, stock: 80, barcode: '7501000123456' },
    { id: 'prod_104', company_id: 'c1', name: 'Galletas Chocolate 100g', price: 16.0, cost_price: 9, stock: 120, barcode: '7501000654321' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useLocalSearch(products, ['name', 'barcode', 'sku'], searchQuery);

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const total = Math.max(0, subtotal - discount);

  // Atajos de teclado F1-F5
  useKeyboardShortcuts({
    onF1Search: () => searchInputRef.current?.focus(),
    onF3Discount: () => {
      const disc = prompt('Ingrese monto de descuento ($):', discount.toString());
      if (disc !== null) setDiscount(parseFloat(disc) || 0);
    },
    onF4Checkout: () => handleCheckout(),
    onF5NewTicket: () => clearCart(),
  });

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const salePayload = {
      items: cart.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
      payment_method: paymentMethod,
      customer_id: selectedCustomer?.id || null,
      discount,
      offline_sale_id: `sale_off_${Date.now()}`
    };

    try {
      if (navigator.onLine) {
        await apiClient.post('/pos/checkout', salePayload);
      } else {
        // Almacenar en IndexedDB offline queue
        await db.sync_queue.add({
          offline_sale_id: salePayload.offline_sale_id,
          payload: salePayload,
          created_at: Date.now(),
          status: 'pending'
        });
      }

      // Impresión directa WebDirect ESC/POS
      const ticketBuffer = ThermalPrinterService.generateESCPOSBuffer({
        title: 'POS SAAS DEMO STORE',
        invoice: salePayload.offline_sale_id,
        items: cart.map((c) => ({ name: c.product_name, qty: c.quantity, price: c.unit_price })),
        total,
      });
      ThermalPrinterService.printDirectUSB(ticketBuffer).catch(() => {});

      setSuccessMessage('¡Venta procesada con éxito!');
      clearCart();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Error en checkout: ${err.message || 'Intente nuevamente'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Columna Izquierda: Catálogo y Búsqueda */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Barra de Búsqueda y Atajos */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre o escanear código (F1)..."
              className="input-field w-full pl-10 pr-4 py-2.5 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-400">F1: Buscar</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-400">F3: Desc</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400">F4: Cobrar</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-400">F5: Limpiar</span>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-1">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() =>
                addToCart({
                  product_id: product.id,
                  product_name: product.name,
                  quantity: 1,
                  unit_price: product.price,
                })
              }
              className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all text-left group"
            >
              <div>
                <span className="text-xs font-mono text-slate-400">{product.barcode || product.id}</span>
                <h3 className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors line-clamp-2 mt-1">
                  {product.name}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                <span className="text-lg font-bold text-emerald-400">${product.price.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Ticket de Venta */}
      <div className="w-96 glass-card p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <h2 className="font-bold text-lg text-slate-100">Ticket de Venta</h2>
            </div>
            <span className="text-xs text-slate-400">{cart.length} ítems</span>
          </div>

          {/* Lista de ítems en carrito */}
          <div className="my-4 max-h-72 overflow-y-auto space-y-3 pr-1">
            {cart.length === 0 ? (
              <p className="text-center text-slate-500 py-12 text-sm">El carrito está vacío</p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-sm text-slate-200">{item.product_name}</p>
                    <p className="text-xs text-slate-400">${item.unit_price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-slate-800 rounded">
                      <Minus className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <span className="text-sm font-bold text-sky-400 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="p-1 hover:bg-slate-800 rounded">
                      <Plus className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button onClick={() => removeFromCart(item.product_id)} className="p-1 hover:bg-rose-950/50 hover:text-rose-400 text-slate-500 rounded ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resumen y Botón de Cobro */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Descuento (F3)</span>
              <span className="text-amber-400">-${discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-100 pt-2 border-t border-slate-800">
              <span>Total</span>
              <span className="text-emerald-400">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                paymentMethod === 'cash' ? 'bg-sky-500/20 text-sky-400 border-sky-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4" /> Efectivo
            </button>
            <button
              onClick={() => setPaymentMethod('card')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                paymentMethod === 'card' ? 'bg-sky-500/20 text-sky-400 border-sky-500' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Tarjeta
            </button>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="btn-success w-full py-3 text-lg font-bold flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            <span>{isProcessing ? 'Procesando...' : 'COBRAR (F4)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
