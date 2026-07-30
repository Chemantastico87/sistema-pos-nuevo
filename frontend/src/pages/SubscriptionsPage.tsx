import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, Users, Package, HardDrive, Tag, Sparkles, AlertCircle, Lock, X } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';
import { useAuthStore } from '../core/store/authStore';

export const SubscriptionsPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [subData, setSubData] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [warningModal, setWarningModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes]: any[] = await Promise.all([
        apiClient.get('/plans').catch(() => []),
        apiClient.get('/subscriptions/current').catch(() => null),
      ]);
      setPlans(pRes || []);
      setSubData(sRes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const res: any = await apiClient.post('/coupons/validate', { code: couponCode });
      setCouponMsg({ text: res.message, type: 'success' });
    } catch (err: any) {
      setCouponMsg({ text: err.message || 'Cupón no válido', type: 'error' });
    }
  };

  const handleSelectPlan = async (planName: string) => {
    try {
      await apiClient.post(`/subscriptions/change-plan?plan_name=${planName}`);
      alert(`Plan VENDIX actualizado a ${planName} con éxito.`);
      fetchData();
    } catch (err: any) {
      if (err.message && err.message.includes('409')) {
        setWarningModal(`No es posible cambiar al plan ${planName} porque la empresa supera los límites permitidos. Ajusta tu número de productos o usuarios antes de continuar.`);
      } else {
        alert(err.message || 'Error al cambiar plan');
      }
    }
  };

  const activePlans = plans.length > 0 ? plans : [
    { id: '1', name: 'Starter', monthly_price: 19, max_users: 1, max_products: 500, has_api: false, has_ai: false, short_description: 'Ideal para pequeños negocios que empiezan.' },
    { id: '2', name: 'Professional', monthly_price: 39, max_users: 5, max_products: 10000, has_api: true, has_ai: false, short_description: 'Pensado para empresas en crecimiento.' },
    { id: '3', name: 'Business', monthly_price: 79, max_users: 999, max_products: 999999, has_api: true, has_ai: true, short_description: 'Empresas consolidadas con múltiples empleados.' },
    { id: '4', name: 'Enterprise', monthly_price: 149, max_users: 9999, max_products: 9999999, has_api: true, has_ai: true, short_description: 'Infraestructura dedicada y soporte 24/7.' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Gestión de Suscripción & Planes VENDIX
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planes comerciales dinámicos, control de cuotas sin interrupción de datos y canje de cupones.
          </p>
        </div>
      </div>

      {/* ESTADO ACTUAL Y RECURSOS UTILIZADOS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Plan Activo</span>
            <span className="text-2xl font-black text-indigo-600 mt-1 block">{user?.plan || 'Starter'}</span>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs uppercase">
            {user?.subscription_status?.toUpperCase() || 'TRIAL'} (14 DÍAS GRATIS)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Usuarios en plantilla</span>
              <span className="font-mono text-indigo-600 font-bold">1 / 5</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-indigo-600 rounded-full w-1/5" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Productos en Catálogo</span>
              <span className="font-mono text-emerald-600 font-bold">12 / 500</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-600 rounded-full w-12/50" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Almacenamiento VENDIX</span>
              <span className="font-mono text-purple-600 font-bold">15 / 500 MB</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-purple-600 rounded-full w-1/12" />
            </div>
          </div>
        </div>
      </div>

      {/* APLICACIÓN DE CUPONES PROMOCIONALES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600" />
          <span>Canjear Cupón Promocional VENDIX</span>
        </h3>
        <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Ej: WELCOME50, PRIMERMES, BLACKFRIDAY"
            className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none uppercase font-mono font-bold"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            Validar
          </button>
        </form>
        {couponMsg && (
          <p className={`text-xs font-bold ${couponMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
            {couponMsg.text}
          </p>
        )}
      </div>

      {/* SELECTOR DE PLANES DINÁMICOS VENDIX */}
      <div className="grid grid-cols-4 gap-4">
        {activePlans.map((p) => {
          const isCurrent = user?.plan === p.name;
          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl border bg-white shadow-xs space-y-4 flex flex-col justify-between ${
                isCurrent ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">{p.name}</span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase">
                      Actual
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-3xl font-black text-slate-900">
                    €{p.monthly_price} <span className="text-xs font-normal text-slate-400">/ mes</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">{p.short_description}</p>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{p.max_users > 1000 ? 'Usuarios Ilimitados' : `${p.max_users} Usuario(s)`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{p.max_products > 100000 ? 'Productos Ilimitados' : `${p.max_products} Productos`}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {p.has_api ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    <span className={p.has_api ? 'text-slate-800' : 'text-slate-400'}>API VENDIX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {p.has_ai ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                    <span className={p.has_ai ? 'text-slate-800' : 'text-slate-400'}>VENDIX AI Contextual</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(p.name)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
              >
                {isCurrent ? 'Plan Activo' : `Cambiar a ${p.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL ADVERTENCIA RECURSOS EXCEDIDOS */}
      {warningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Límite de Recursos Excedido</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{warningModal}</p>
            </div>
            <button
              onClick={() => setWarningModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Entendido y Modificar Recursos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
