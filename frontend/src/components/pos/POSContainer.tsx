import React, { useState, useRef } from 'react';
import { 
  Star, ShoppingCart, Trash2, Plus, Minus, CreditCard, DollarSign, 
  User, Printer, CheckCircle2, QrCode, Grid, Layers, RefreshCw, Search,
  Coffee, Cookie, Milk, ShoppingBag, Sparkles, Box
} from 'lucide-react';
import { usePOSStore } from '../../core/store/posStore';
import { useKeyboardShortcuts } from '../../core/hooks/useKeyboardShortcuts';
import { ThermalPrinterService } from '../hardware/ThermalPrinterService';

interface DisplayProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  isFavorite?: boolean;
}

const INITIAL_PRODUCTS: DisplayProduct[] = [
  { id: 'p1', name: 'Agua Mineral 600ml', price: 1200, stock: 150, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4e?auto=format&fit=crop&q=80&w=300' },
  { id: 'p2', name: 'Coca Cola 600ml', price: 2500, stock: 85, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300', isFavorite: true },
  { id: 'p3', name: 'Papas Rizadas', price: 3200, stock: 60, category: 'Snacks', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=300', isFavorite: true },
  { id: 'p4', name: 'Leche Entera 1L', price: 3800, stock: 40, category: 'Lácteos', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300' },
  { id: 'p5', name: 'Arroz 1kg', price: 4200, stock: 70, category: 'Abarrotes', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300' },
  { id: 'p6', name: 'Aceite Vegetal 1L', price: 6500, stock: 30, category: 'Abarrotes', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300' },
  { id: 'p7', name: 'Jabón en Polvo 1kg', price: 5900, stock: 25, category: 'Limpieza', image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&q=80&w=300' },
  { id: 'p8', name: 'Detergente Líquido', price: 7800, stock: 20, category: 'Limpieza', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=300' },
  { id: 'p9', name: 'Pan de Molde', price: 2900, stock: 45, category: 'Snacks', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
  { id: 'p10', name: 'Queso Mozzarella', price: 12500, stock: 15, category: 'Lácteos', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=300' },
  { id: 'p11', name: 'Huevos x 30', price: 11000, stock: 22, category: 'Abarrotes', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=300' },
  { id: 'p12', name: 'Azúcar 1kg', price: 2600, stock: 55, category: 'Abarrotes', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&q=80&w=300' },
];

export const POSContainer: React.FC = () => {
  const { cart, selectedCustomer, discount, paymentMethod, addToCart, removeFromCart, updateQuantity, setDiscount, setPaymentMethod, clearCart } = usePOSStore();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [filterType, setFilterType] = useState<'all' | 'fav' | 'promo'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Inicializar el carrito con los elementos del screenshot si está vacío
  React.useEffect(() => {
    if (cart.length === 0) {
      addToCart({ product_id: 'p2', product_name: 'Coca Cola 600ml', quantity: 2, unit_price: 2500 });
      addToCart({ product_id: 'p3', product_name: 'Papas Rizadas', quantity: 1, unit_price: 3200 });
      addToCart({ product_id: 'p4', product_name: 'Leche Entera 1L', quantity: 1, unit_price: 3800 });
    }
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const tax = Math.round(subtotal * 0.19);
  const total = Math.max(0, subtotal - discount + tax);

  useKeyboardShortcuts({
    onF3Discount: () => {
      const d = prompt('Descuento ($):', discount.toString());
      if (d !== null) setDiscount(parseFloat(d) || 0);
    },
    onF4Checkout: () => handleCheckout(),
    onF5NewTicket: () => clearCart(),
  });

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      const invoice = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
      const buffer = ThermalPrinterService.generateESCPOSBuffer({
        title: 'SISTEM POS DEMO',
        invoice,
        items: cart.map(c => ({ name: c.product_name, qty: c.quantity, price: c.unit_price })),
        total,
      });
      ThermalPrinterService.printDirectUSB(buffer).catch(() => {});

      setSuccessMsg(`¡Venta #${invoice} procesada con éxito!`);
      clearCart();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('Venta procesada en modo offline.');
      clearCart();
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = INITIAL_PRODUCTS.filter(p => {
    if (filterType === 'fav' && !p.isFavorite) return false;
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-5 overflow-hidden p-1">
      {/* Columna Izquierda: Catálogo y Productos */}
      <div className="flex-1 flex flex-col justify-between gap-4 overflow-hidden">
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Top Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Todos los productos
              </button>
              <button
                onClick={() => setFilterType('fav')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  filterType === 'fav'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Favoritos
              </button>
              <button
                onClick={() => setFilterType('promo')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Promociones
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 cursor-pointer hover:bg-slate-50">
                <Grid className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                <QrCode className="w-3.5 h-3.5 text-slate-500" />
                <span>Escanear</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">F3</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'Todos', label: 'Todos', icon: Layers },
              { id: 'Bebidas', label: 'Bebidas', icon: Coffee },
              { id: 'Snacks', label: 'Snacks', icon: Cookie },
              { id: 'Lácteos', label: 'Lácteos', icon: Milk },
              { id: 'Abarrotes', label: 'Abarrotes', icon: ShoppingBag },
              { id: 'Limpieza', label: 'Limpieza', icon: Box },
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

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() =>
                  addToCart({
                    product_id: p.id,
                    product_name: p.name,
                    quantity: 1,
                    unit_price: p.price,
                  })
                }
                className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group relative"
              >
                <div className="absolute top-3 right-3 z-10">
                  <Star className={`w-4 h-4 ${p.isFavorite ? 'text-indigo-600 fill-indigo-600' : 'text-slate-300 hover:text-amber-400'}`} />
                </div>

                <div className="h-28 flex items-center justify-center mb-2 overflow-hidden rounded-xl bg-slate-50 group-hover:scale-105 transition-transform">
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-xs text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-base font-extrabold text-slate-900">${p.price.toLocaleString('es-CO')}</p>
                  <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Toolbar Action Buttons */}
        <div className="bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-xs">
          <div className="flex items-center gap-2">
            <button onClick={() => clearCart()} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <span>Nueva Venta</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F1</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <span>Buscar Producto</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F2</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <span>Nota Manual</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F8</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const d = prompt('Monto descuento ($):', discount.toString());
              if (d !== null) setDiscount(parseFloat(d) || 0);
            }} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <span>Descuento</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F7</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5">
              <span>Abrir Gaveta</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500">F8</span>
            </button>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Ticket de Venta */}
      <div className="w-[360px] bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm shrink-0">
        <div className="space-y-4">
          {/* Header Ticket */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="font-extrabold text-base text-slate-900">Ticket de venta</h2>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1">
                Suspender <span className="text-[10px] text-indigo-500">F5</span>
              </span>
              <button onClick={() => clearCart()} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Header Column Table */}
          <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase px-1">
            <span className="col-span-5">Producto</span>
            <span className="col-span-2 text-center">Cant.</span>
            <span className="col-span-2 text-right">Precio</span>
            <span className="col-span-3 text-right">Total</span>
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-xs">No hay productos en el ticket</p>
            ) : (
              cart.map((item) => (
                <div key={item.product_id} className="grid grid-cols-12 items-center text-xs text-slate-800 py-1.5 border-b border-slate-100 hover:bg-slate-50 rounded-lg px-1">
                  <div className="col-span-5 font-semibold text-slate-800 truncate pr-1">
                    {item.product_name}
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-700">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-medium text-slate-600">
                    ${item.unit_price.toLocaleString('es-CO')}
                  </div>
                  <div className="col-span-3 text-right font-bold text-slate-900 flex items-center justify-end gap-1">
                    <span>${(item.quantity * item.unit_price).toLocaleString('es-CO')}</span>
                    <button onClick={() => removeFromCart(item.product_id)} className="text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Input (Optional) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Cliente (opcional)</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 border border-slate-200">F4</span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none"
              />
              <User className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Total Summary & Checkout Actions */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          {successMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Descuento</span>
              <span className="font-semibold text-slate-800">${discount.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Impuestos (19%)</span>
              <span className="font-semibold text-slate-800">${tax.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
              <span className="font-extrabold text-sm text-slate-900">TOTAL</span>
              <span className="font-black text-2xl text-indigo-600">${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Payment Options Grid */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('cash')}
              className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Efectivo</span>
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
              <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Tarjeta</span>
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
              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Mixto</span>
              <span className="text-[10px] opacity-80">F3</span>
            </button>
          </div>

          {/* Big Cobrar Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-extrabold text-base shadow-lg shadow-indigo-600/30 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span>{isProcessing ? 'Procesando...' : 'Cobrar'}</span>
            <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-bold">Enter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
