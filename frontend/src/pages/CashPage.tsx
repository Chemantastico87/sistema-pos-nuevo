import React, { useState, useEffect } from 'react';
import { Lock, Unlock, DollarSign, CreditCard, Send, ArrowUpRight, ArrowDownRight, FileText, Download, Printer, Mail, History, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';
import { useAuthStore } from '../core/store/authStore';
import { useTranslation } from '../core/store/languageStore';

export const CashPage: React.FC = () => {
  const [currentCash, setCurrentCash] = useState<any>(null);
  const [closureSummary, setClosureSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { t } = useTranslation();
  const currency = useAuthStore((s) => s.user?.currency || 'EUR');
  const user = useAuthStore((s) => s.user);

  // Abrir caja form
  const [openingBalance, setOpeningBalance] = useState('100.00');

  // Cerrar caja form
  const [countedCash, setCountedCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [signedBy, setSignedBy] = useState('');

  useEffect(() => {
    fetchCashData();
  }, []);

  const fetchCashData = async () => {
    setIsLoading(true);
    try {
      const [currRes, histRes]: any[] = await Promise.all([
        apiClient.get('/cash/current'),
        apiClient.get('/cash/history'),
      ]);
      setCurrentCash(currRes);
      setHistory(histRes || []);

      if (currRes && currRes.id) {
        const sumRes: any = await apiClient.get(`/cash/summary/${currRes.id}`);
        setClosureSummary(sumRes);
      }
    } catch (err) {
      console.error('Error cargando estado de caja:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/cash/open', {
        opening_balance: parseFloat(openingBalance) || 0,
        name: 'Caja Principal',
      });
      fetchCashData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al abrir caja.');
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/cash/close', {
        closing_balance: parseFloat(countedCash) || 0,
        closing_notes: closingNotes,
        signed_by: signedBy || user?.full_name,
      });
      alert('Caja cerrada correctamente. Se ha generado el informe de cuadre diario.');
      setCountedCash('');
      setClosingNotes('');
      fetchCashData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al cerrar caja.');
    }
  };

  const handleReopenRegister = async (cashId: string) => {
    try {
      await apiClient.post(`/cash/reopen/${cashId}`);
      alert('Caja reabierta con permisos de administrador.');
      fetchCashData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Permiso denegado para reabrir caja.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            {t('cash_title')}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('cash_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentCash && (
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print_summary')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ESTADO 1: NO HAY CAJA ABIERTA */}
      {!currentCash && (
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t('register_closed_title')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('register_closed_desc')}
            </p>
          </div>

          <form onSubmit={handleOpenRegister} className="space-y-3 pt-2 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('initial_fund_label')} ({currency})</label>
              <input
                type="number"
                step="0.01"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="100.00"
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{t('open_shift_btn')}</span>
            </button>
          </form>
        </div>
      )}

      {/* ESTADO 2: CAJA ABIERTA CON DESGLOSE COMPLETO */}
      {currentCash && closureSummary && (
        <div className="grid grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Desglose por Medio de Pago */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-base font-bold text-slate-900">{t('realtime_sales_summary')}</h2>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {t('opened_from')}: {new Date(closureSummary.opened_at).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('cash_sales')}</span>
                  <span className="text-lg font-black text-slate-900 mt-1 block">
                    {currency} {closureSummary.sales_cash?.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('card_sales')}</span>
                  <span className="text-lg font-black text-indigo-600 mt-1 block">
                    {currency} {closureSummary.sales_card?.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('bizum_sales')}</span>
                  <span className="text-lg font-black text-purple-600 mt-1 block">
                    {currency} {closureSummary.sales_bizum?.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('transfer_sales')}</span>
                  <span className="text-lg font-black text-teal-600 mt-1 block">
                    {currency} {closureSummary.sales_transfer?.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('voucher_sales')}</span>
                  <span className="text-lg font-black text-amber-600 mt-1 block">
                    {currency} {closureSummary.sales_voucher?.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 block uppercase">{t('mixed_sales')}</span>
                  <span className="text-lg font-black text-slate-700 mt-1 block">
                    {currency} {closureSummary.sales_mixed?.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-800 uppercase block">{t('total_session_sales')}</span>
                  <span className="text-2xl font-black text-indigo-950 mt-0.5 block">
                    {currency} {closureSummary.total_sales?.toFixed(2)}
                  </span>
                </div>
                <div className="text-right text-xs text-indigo-700 font-medium">
                  <div>{t('discount')}: {currency} {closureSummary.discounts?.toFixed(2)}</div>
                  <div>{t('taxes')}: {currency} {closureSummary.taxes?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Arqueo y Dinero Esperado */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('expected_cash_calc')}</h3>
              
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-600">{t('initial_fund_label')}:</span>
                  <span className="font-bold text-slate-900">{currency} {closureSummary.opening_balance?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">(+) {t('cash_sales')}:</span>
                  <span className="font-bold text-emerald-600">+{currency} {closureSummary.sales_cash?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">(+) Depósitos:</span>
                  <span className="font-bold text-emerald-600">+{currency} {closureSummary.manual_deposits?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-600">(-) Retiradas:</span>
                  <span className="font-bold text-rose-600">-{currency} {closureSummary.manual_withdrawals?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black text-slate-900">
                  <span>{t('expected_cash_physical')}:</span>
                  <span className="text-indigo-600 font-mono text-base">{currency} {closureSummary.expected_balance?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Cuadre & Cierre */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">{t('close_register_btn')}</h3>

            <form onSubmit={handleCloseRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('counted_cash_label')} ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-3 text-base font-black text-slate-900 outline-none"
                />
              </div>

              {countedCash && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold ${
                  (parseFloat(countedCash) - closureSummary.expected_balance) === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span>{t('cash_difference')}:</span>
                    <span className="font-mono text-sm">
                      {currency} {(parseFloat(countedCash) - closureSummary.expected_balance).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] block mt-1">
                    {(parseFloat(countedCash) - closureSummary.expected_balance) === 0
                      ? t('perfect_match')
                      : t('mismatch_warning')}
                  </span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Observaciones</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Comentarios adicionales..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs text-slate-800 outline-none h-20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Firma / Responsable</label>
                <input
                  type="text"
                  value={signedBy}
                  onChange={(e) => setSignedBy(e.target.value)}
                  placeholder={user?.full_name || 'Nombre del cajero'}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{t('close_shift_btn')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Historial de Cierres Anteriores con Opciones de Reimpresión y Reapertura */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">{t('audited_history_title')}</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">{t('shift_id')}</th>
                <th className="p-3">{t('opening_time')}</th>
                <th className="p-3">{t('closing_time')}</th>
                <th className="p-3 text-right">{t('initial_balance')}</th>
                <th className="p-3 text-right">{t('counted_balance')}</th>
                <th className="p-3 text-right">{t('cash_difference')}</th>
                <th className="p-3">{t('status')}</th>
                <th className="p-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{reg.id}</td>
                  <td className="p-3 text-slate-500">{new Date(reg.opened_at).toLocaleString()}</td>
                  <td className="p-3 text-slate-500">{reg.closed_at ? new Date(reg.closed_at).toLocaleString() : '-'}</td>
                  <td className="p-3 text-right font-medium">{currency} {parseFloat(reg.opening_balance || '0').toFixed(2)}</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {reg.closing_balance !== null ? `${currency} ${parseFloat(reg.closing_balance).toFixed(2)}` : '-'}
                  </td>
                  <td className="p-3 text-right">
                    {reg.difference !== null ? (
                      <span className={`font-bold ${parseFloat(reg.difference) === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {currency} {parseFloat(reg.difference).toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      reg.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {reg.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    {reg.status === 'closed' && (
                      <button
                        onClick={() => handleReopenRegister(reg.id)}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-all cursor-pointer"
                        title="Reabrir únicamente con permisos de administrador"
                      >
                        {t('reopen')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    {t('no_results')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
