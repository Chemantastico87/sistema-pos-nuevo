import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, Users, Package, HardDrive } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';
import { useAuthStore } from '../core/store/authStore';

export const SubscriptionsPage: React.FC = () => {
  const [subData, setSubData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSub();
  }, []);

  const fetchSub = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get('/subscriptions/current');
      setSubData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planName: string) => {
    try {
      await apiClient.post('/subscriptions/change-plan', null, { params: { plan_name: planName } });
      alert(`Plan actualizado a ${planName} con éxito.`);
      fetchSub();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Error al cambiar plan');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Gestión de Suscripción & Control de Cuotas
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Planes comerciales, verificación automática de límites, estado de prueba e historial de facturación.
          </p>
        </div>
      </div>

      {/* Estado Actual */}
      {subData && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase">Plan Actual</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{subData.plan}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
              {subData.subscription_status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase">Usuarios ({subData.usage.users_used} / {subData.usage.max_users})</span>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(subData.usage.users_used / subData.usage.max_users) * 100}%` }} />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase">Productos ({subData.usage.products_used} / {subData.usage.max_products})</span>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${(subData.usage.products_used / subData.usage.max_products) * 100}%` }} />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-400 block uppercase">Almacenamiento MB ({subData.usage.storage_mb_used} / {subData.usage.max_storage_mb})</span>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de Planes Comercial */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { name: 'Starter', price: '€19', users: 3, prods: 300, desc: 'Para pequeños comercios' },
          { name: 'Profesional', price: '€39', users: 10, prods: 2000, desc: 'Para negocios en crecimiento' },
          { name: 'Business', price: '€79', users: 25, prods: 10000, desc: 'Para múltiples sucursales' },
          { name: 'Enterprise', price: '€149', users: 'Ilimitados', prods: 'Ilimitados', desc: 'Infraestructura dedicada' },
        ].map((p) => (
          <div key={p.name} className={`p-6 rounded-2xl border bg-white shadow-xs space-y-4 ${subData?.plan === p.name ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'}`}>
            <div>
              <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{p.price} <span className="text-xs font-normal text-slate-400">/ mes</span></span>
              <span className="text-[11px] text-slate-500 block mt-1">{p.desc}</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <li className="flex items-center gap-2">✓ Hasta {p.users} usuarios</li>
              <li className="flex items-center gap-2">✓ Hasta {p.prods} productos</li>
              <li className="flex items-center gap-2">✓ Resguardos diarios</li>
            </ul>

            <button
              onClick={() => handleSelectPlan(p.name)}
              disabled={subData?.plan === p.name}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                subData?.plan === p.name
                  ? 'bg-slate-100 text-slate-400 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {subData?.plan === p.name ? 'Plan Actual' : `Cambiar a ${p.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
