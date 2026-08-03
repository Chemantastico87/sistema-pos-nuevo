import React, { useState, useEffect } from 'react';
import {
  Receipt, Search, Filter, Printer, Trash2, CheckCircle2, XCircle,
  Clock, Calendar, DollarSign, CreditCard, Layers, Eye, RefreshCw, AlertTriangle, ArrowLeft
} from 'lucide-react';
import { useCashStore, SaleRecord } from '../../core/store/cashStore';
import { useSettingsStore } from '../../core/store/settingsStore';
import { useTranslation } from '../../core/store/languageStore';
import { apiClient } from '../../core/services/apiClient';
import { ThermalPrinterService } from '../hardware/ThermalPrinterService';
import { db } from '../../core/db/dexieDB';

export const DailySalesHistory: React.FC = () => {
  const { t } = useTranslation();
  const { salesHistory, cancelSaleRecord } = useCashStore();
  const { formatMoney, currencySymbol } = useSettingsStore();

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  
  // Modales
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
  const [saleToCancel, setSaleToCancel] = useState<SaleRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchSales();
  }, [salesHistory]);

  const fetchSales = async () => {
    try {
      const apiSales: any = await apiClient.get('/pos/sales').catch(() => []);
      if (Array.isArray(apiSales) && apiSales.length > 0) {
        // Mapear ventas devueltas por el API
        const formatted: SaleRecord[] = apiSales.map((s: any) => ({
          id: s.id,
          invoiceNumber: s.invoice_number || s.id,
          date: s.created_at ? new Date(s.created_at).toLocaleString('es-ES') : new Date().toLocaleString('es-ES'),
          customer: s.customer_name || 'Cliente General',
          total: parseFloat(s.total) || 0,
          paymentMethod: s.payment_method || 'cash',
          items: s.items || [],
          status: s.status === 'cancelled' ? 'cancelled' : 'completed',
        }));
        setSales(formatted);
      } else {
        setSales(salesHistory);
      }
    } catch (e) {
      setSales(salesHistory);
    }
  };

  const handleCancelSale = async () => {
    if (!saleToCancel) return;
    setIsCancelling(true);
    try {
      // 1. Notificar al API Backend
      await apiClient.post(`/pos/sales/${saleToCancel.id}/cancel`, {}).catch(() => null);

      // 2. Actualizar estado en CashStore local
      cancelSaleRecord(saleToCancel.id);

      // 3. Devolver stock de productos a DexieDB local
      if (saleToCancel.items && saleToCancel.items.length > 0) {
        for (const item of saleToCancel.items) {
          const prod = await db.products.get(item.product_id);
          if (prod) {
            await db.products.update(prod.id, { stock: prod.stock + item.quantity });
          }
        }
      }

      // Actualizar vista local
      setSales((prev) =>
        prev.map((s) => (s.id === saleToCancel.id ? { ...s, status: 'cancelled' } : s))
      );

      setActionNotice(`✅ Venta ${saleToCancel.invoiceNumber} anulada correctamente. Se ha devuelto el stock al inventario.`);
      setSaleToCancel(null);
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Error anulando la venta');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrintReceipt = (sale: SaleRecord) => {
    try {
      const buffer = ThermalPrinterService.generateESCPOSBuffer({
        title: 'VENDIX POS STORE',
        invoice: sale.invoiceNumber,
        items: (sale.items || []).map((it) => ({
          name: it.product_name,
          qty: it.quantity,
          price: it.unit_price,
        })),
        total: sale.total,
      });
      ThermalPrinterService.printDirectUSB(buffer).catch(() => {});
      window.print();
    } catch (e) {
      window.print();
    }
  };

  // Filtrado de ventas
  const filteredSales = sales.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (methodFilter !== 'all' && s.paymentMethod !== methodFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.total.toString().includes(q)
      );
    }
    return true;
  });

  // KPIs del día
  const completedSales = sales.filter((s) => s.status !== 'cancelled');
  const totalRevenue = completedSales.reduce((acc, s) => acc + s.total, 0);
  const cashTotal = completedSales.filter((s) => s.paymentMethod === 'cash').reduce((acc, s) => acc + s.total, 0);
  const cardTotal = completedSales.filter((s) => s.paymentMethod === 'card').reduce((acc, s) => acc + s.total, 0);
  const cancelledCount = sales.filter((s) => s.status === 'cancelled').length;

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER DE VENTAS DEL DÍA */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              {t('daily_sales_title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              Control de Cajas & Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Recupera comprobantes de ventas procesadas, reimprime tickets de compra o anula ventas con devolución de stock.
          </p>
        </div>

        <button
          onClick={fetchSales}
          className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-indigo-600" />
          <span>{t('refresh')}</span>
        </button>
      </div>

      {/* BANNER DE ACCIÓN / NOTIFICACIÓN */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* RESUMEN DE CARDS DE VENTAS */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-lg shadow-indigo-500/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t('recap_today')}</span>
          <p className="text-2xl font-black">{formatMoney(totalRevenue)}</p>
          <span className="text-[11px] opacity-90 block">{completedSales.length} ventas completadas</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cash_received')}</span>
          <p className="text-2xl font-extrabold text-emerald-600">{formatMoney(cashTotal)}</p>
          <span className="text-[11px] text-slate-500 block">Cobros en caja física</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('card_received')}</span>
          <p className="text-2xl font-extrabold text-blue-600">{formatMoney(cardTotal)}</p>
          <span className="text-[11px] text-slate-500 block">Datafono / TPV Virtual</span>
        </div>

        <div className="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('cancelled_count')}</span>
          <p className="text-2xl font-extrabold text-rose-600">{cancelledCount}</p>
          <span className="text-[11px] text-slate-500 block">Tickets cancelados</span>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por N° Ticket (FAC-XXXX), cliente o monto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none shadow-xs"
          >
            <option value="all">{t('filter_all_status')}</option>
            <option value="completed">Solo Completadas (🟢)</option>
            <option value="cancelled">Solo Anuladas (🔴)</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none shadow-xs"
          >
            <option value="all">{t('filter_all_methods')}</option>
            <option value="cash">{t('cash_pay')}</option>
            <option value="card">{t('card_pay')}</option>
            <option value="mixed">{t('mixed_pay')}</option>
          </select>
        </div>
      </div>

      {/* TABLA DE VENTAS DEL DÍA */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">{t('ticket_num')}</th>
              <th className="px-6 py-4">{t('date_time')}</th>
              <th className="px-6 py-4">{t('customer')}</th>
              <th className="px-6 py-4">{t('payment_method')}</th>
              <th className="px-6 py-4">{t('amount')}</th>
              <th className="px-6 py-4">{t('status')}</th>
              <th className="px-6 py-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-600">No hay ventas registradas con los filtros seleccionados.</p>
                </td>
              </tr>
            ) : (
              filteredSales.map((s) => {
                const isCancelled = s.status === 'cancelled';
                return (
                  <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${isCancelled ? 'bg-rose-50/40' : ''}`}>
                    <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                      {s.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {s.customer}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        s.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        s.paymentMethod === 'card' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {s.paymentMethod === 'cash' ? '💵 Efectivo' : s.paymentMethod === 'card' ? '💳 Tarjeta' : '🔀 Mixto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      {formatMoney(s.total)}
                    </td>
                    <td className="px-6 py-4">
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] uppercase border border-rose-200">
                          🔴 Anulada
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase border border-emerald-200">
                          🟢 Completada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-100 transition-colors cursor-pointer"
                          title="Ver Ticket / Reimprimir"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver / Reimprimir
                        </button>

                        {!isCancelled && (
                          <button
                            onClick={() => setSaleToCancel(s)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="Anular / Cancelar Venta"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL VER DETALLE DE TICKET & REIMPRIMIR */}
      {selectedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-scaleIn font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" /> Detalle del Ticket
                </h3>
                <p className="text-xs font-mono font-bold text-indigo-600">{selectedSale.invoiceNumber}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">FECHA & HORA</span>
                  <span className="font-bold text-slate-800">{selectedSale.date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">CLIENTE</span>
                  <span className="font-bold text-slate-800">{selectedSale.customer}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">MÉTODO PAGO</span>
                  <span className="font-bold text-slate-800 uppercase">{selectedSale.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">ESTADO</span>
                  <span className={`font-bold ${selectedSale.status === 'cancelled' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedSale.status === 'cancelled' ? 'Anulada' : 'Completada'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-extrabold text-slate-900 block border-b border-slate-100 pb-1">Productos Vendidos:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(selectedSale.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-50">
                      <div>
                        <span className="font-bold text-slate-800 block">{it.product_name}</span>
                        <span className="text-[10px] text-slate-400">{it.quantity} x {formatMoney(it.unit_price)}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatMoney(it.quantity * it.unit_price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="font-black text-sm text-slate-900">TOTAL:</span>
                <span className="font-black text-xl text-indigo-600">{formatMoney(selectedSale.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSelectedSale(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600"
              >
                Cerrar
              </button>
              <button
                onClick={() => handlePrintReceipt(selectedSale)}
                className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Reimprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ANULACIÓN DE VENTA */}
      {saleToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-center font-sans">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">¿Anular / Cancelar Venta?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ¿Confirmas la anulación de la venta <span className="font-mono font-bold text-slate-800">{saleToCancel.invoiceNumber}</span> por <span className="font-bold text-slate-800">{formatMoney(saleToCancel.total)}</span>? Se devolverá el stock de productos al inventario.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSaleToCancel(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleCancelSale}
                disabled={isCancelling}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {isCancelling ? 'Anulando...' : 'Sí, Anular Venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
