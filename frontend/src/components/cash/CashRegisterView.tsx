import React, { useState } from 'react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, Lock, Unlock, Printer, AlertTriangle, CheckCircle2, XCircle, Receipt, Trash2, Eye } from 'lucide-react';
import { useCashStore, SaleRecord } from '../../core/store/cashStore';
import { useSettingsStore } from '../../core/store/settingsStore';

export const CashRegisterView: React.FC = () => {
  const { 
    isOpen, openingBalance, openedAt, cashSales, cardSales, mixedSales, deposits, withdrawals, 
    salesHistory, openRegister, closeRegister, cancelSaleRecord, addMovement 
  } = useCashStore();
  const { formatMoney, currencySymbol } = useSettingsStore();

  // Modales
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SaleRecord | null>(null);

  // Form states
  const [openAmount, setOpenAmount] = useState('50');
  const [countedAmount, setCountedAmount] = useState('');
  const [movementType, setMovementType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [movementAmount, setMovementAmount] = useState('');

  const totalExpectedCash = openingBalance + cashSales + deposits - withdrawals;
  const countedNum = parseFloat(countedAmount) || 0;
  const discrepancy = countedNum - totalExpectedCash;

  const handleConfirmOpen = (e: React.FormEvent) => {
    e.preventDefault();
    openRegister(parseFloat(openAmount) || 0);
    setShowOpenModal(false);
  };

  const handleConfirmClose = () => {
    closeRegister();
    setShowCloseModal(false);
    alert('Caja cerrada exitosamente. Ticket de Cierre Z emitido.');
  };

  const handleAddMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(movementAmount) || 0;
    if (amt <= 0) return;
    addMovement(movementType, amt);
    setMovementAmount('');
    setShowMovementModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Control de Caja & Cierre Z Diario</h1>
          <p className="text-slate-500 text-sm">Auditoría de efectivo, arqueo físico y control diario de ventas</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMovementModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <span>+ Ingreso / Egreso Efectivo</span>
          </button>

          {isOpen ? (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-600/30 hover:bg-rose-700"
            >
              <Lock className="w-4 h-4" /> Realizar Cierre Z de Caja
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 hover:bg-emerald-700"
            >
              <Unlock className="w-4 h-4" /> Abrir Caja Registradora
            </button>
          )}
        </div>
      </div>

      {/* State Banner */}
      <div className={`p-4 rounded-3xl border flex items-center justify-between ${
        isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
            isOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-sm">
              Caja Nº 1 - {isOpen ? 'ABIERTA' : 'CERRADA'}
            </p>
            <p className="text-xs opacity-80">Apertura: {openedAt}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase opacity-75">Fondo Inicial</p>
          <p className="text-lg font-black">{formatMoney(openingBalance)}</p>
        </div>
      </div>

      {/* Metricas de Dinero Esperado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Ventas Efectivo</span>
          <p className="text-2xl font-black text-slate-900">{formatMoney(cashSales)}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Recibido en caja</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Ventas Tarjeta / Digital</span>
          <p className="text-2xl font-black text-slate-900">{formatMoney(cardSales + mixedSales)}</p>
          <span className="text-[11px] text-slate-400 font-semibold">Directo a cuenta bancaria</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Entradas / Salidas</span>
          <p className="text-2xl font-black text-slate-900">{formatMoney(deposits - withdrawals)}</p>
          <span className="text-[11px] text-slate-400 font-semibold">+{formatMoney(deposits)} / -{formatMoney(withdrawals)}</span>
        </div>

        <div className="bg-indigo-600 text-white rounded-3xl p-5 space-y-1 shadow-lg shadow-indigo-600/30">
          <span className="text-xs font-bold text-indigo-200 uppercase">Efectivo Esperado Z</span>
          <p className="text-2xl font-black">{formatMoney(totalExpectedCash)}</p>
          <span className="text-[11px] text-indigo-200 font-semibold">Fondo + Efectivo - Salidas</span>
        </div>
      </div>

      {/* Modal Apertura */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Apertura de Caja Registradora</h3>
            <form onSubmit={handleConfirmOpen} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto Inicial en Efectivo ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openAmount}
                  onChange={(e) => setOpenAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-black text-lg outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowOpenModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-600/30">Abrir Caja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cierre Z & Arqueo Físico */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" /> Arqueo & Cierre Z de Caja
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>Efectivo Esperado en Sistema:</span>
                  <span className="font-bold text-slate-900">{formatMoney(totalExpectedCash)}</span>
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-900 block mb-1">Efectivo Contado Físicamente ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ingresa el dinero contado"
                  value={countedAmount}
                  onChange={(e) => setCountedAmount(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-indigo-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-black text-lg outline-none focus:border-indigo-600"
                />
              </div>

              {countedAmount !== '' && (
                <div className={`p-3.5 rounded-2xl border font-bold flex items-center justify-between ${
                  discrepancy === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  discrepancy > 0 ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <span>Discrepancia de Caja:</span>
                  <span className="font-black text-base">
                    {discrepancy === 0 ? 'Exacto ($0.00)' :
                     discrepancy > 0 ? `Sobrante (+${formatMoney(discrepancy)})` :
                     `Faltante (-${formatMoney(Math.abs(discrepancy))})`}
                  </span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setShowCloseModal(false)} className="w-1/2 py-3 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button type="button" onClick={handleConfirmClose} className="w-1/2 py-3 rounded-xl bg-rose-600 text-white font-extrabold shadow-md shadow-rose-600/30">Confirmar Cierre Z</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Movimiento de Dinero */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-2">Movimiento Manual de Efectivo</h3>
            <form onSubmit={handleAddMovementSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento</label>
                <select
                  value={movementType}
                  onChange={(e: any) => setMovementType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold outline-none"
                >
                  <option value="deposit">Ingreso (+ Entrada de efectivo)</option>
                  <option value="withdrawal">Egreso (- Retiro o pago proveedor)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="20.00"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowMovementModal(false)} className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600">Cancelar</button>
                <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-xs">
            <div className="text-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">{selectedTicket.invoiceNumber}</h3>
              <p className="text-slate-500">{selectedTicket.date}</p>
            </div>
            <div className="space-y-1">
              {selectedTicket.items.map((it, idx) => (
                <div key={idx} className="flex justify-between font-medium text-slate-700">
                  <span>{it.quantity}x {it.product_name}</span>
                  <span className="font-bold">{formatMoney(it.quantity * it.unit_price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-extrabold text-sm text-slate-900">
              <span>TOTAL:</span>
              <span className="text-indigo-600 font-black">{formatMoney(selectedTicket.total)}</span>
            </div>
            <button onClick={() => setSelectedTicket(null)} className="w-full py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700">Cerrar</button>
          </div>
        </div>
      )}

      {/* Control de Ventas del Día */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
          Control de Ventas Realizadas en el Día
        </h3>

        {salesHistory.length === 0 ? (
          <p className="text-center text-slate-400 py-8 text-xs font-medium">No se han registrado ventas en la sesión de hoy.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Factura</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{s.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{s.customer}</td>
                    <td className="px-4 py-3 capitalize font-bold text-slate-700">{s.paymentMethod}</td>
                    <td className="px-4 py-3 font-black text-slate-900">{formatMoney(s.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        s.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {s.status === 'completed' ? '● Completado' : '✕ Anulado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTicket(s)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </button>
                        {s.status === 'completed' && (
                          <button
                            onClick={() => cancelSaleRecord(s.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[11px] hover:bg-rose-100 flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
