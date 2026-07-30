import React, { useState, useEffect } from 'react';
import { Building2, Users, DollarSign, AlertTriangle, ShieldCheck, UserCheck, Eye, Plus, Search, CheckCircle2, Lock, Zap } from 'lucide-react';
import { apiClient } from '../core/services/apiClient';
import { useAuthStore } from '../core/store/authStore';

export const SuperAdminPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const fetchSuperAdminData = async () => {
    setIsLoading(true);
    try {
      const [mRes, cRes]: any[] = await Promise.all([
        apiClient.get('/superadmin/metrics').catch(() => null),
        apiClient.get('/superadmin/companies').catch(() => []),
      ]);
      setMetrics(mRes);
      setCompanies(cRes || []);
    } catch (err) {
      console.error('Error cargando VENDIX Cloud:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImpersonate = async (companyId: string) => {
    try {
      const res: any = await apiClient.post(`/superadmin/impersonate/${companyId}`);
      if (res.access_token) {
        setAuth(
          {
            id: 'impersonated_usr',
            company_id: companyId,
            company_name: res.company_name,
            full_name: `[Impersonación Auditada] ${res.user_email}`,
            role: 'admin',
            permissions: [
              'can_change_price', 'can_delete_sale', 'can_open_cash_register',
              'can_reopen_cash_register', 'can_view_profit', 'can_manage_inventory',
              'can_manage_users', 'can_manage_settings', 'can_export_reports'
            ],
            onboarding_completed: true,
          },
          res.access_token
        );
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      alert(err.message || 'Error al iniciar impersonación.');
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER DE VENDIX CLOUD */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
              VENDIX Cloud
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">
              Centro de Control SaaS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestión de empresas multi-tenant, ciclo de vida de licencias, impersonación auditada y monitoreo global.
          </p>
        </div>
      </div>

      {/* KPI GRID DE VENDIX CLOUD */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Empresas Registradas</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics?.total_companies || companies.length || 1}</span>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
              {metrics?.active_companies || 1} Activas en producción
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Usuarios Activos</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{metrics?.active_users || 1}</span>
            <span className="text-[11px] font-bold text-indigo-600 mt-1 block">Licencias operativas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Facturación Estimada MRR</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              €{metrics?.estimated_monthly_revenue?.toLocaleString() || '39'}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Ingreso mensual recurrente</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block uppercase">Volumen Procesado</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              €{metrics?.total_sales_volume?.toLocaleString() || '1,254'}
            </span>
            <span className="text-[11px] font-bold text-purple-600 mt-1 block">Ventas TPV totales</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TABLA DE EMPRESAS Y CONTROL DE LICENCIAS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Directorio de Empresas VENDIX</h2>
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa o email..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">Email Corporativo</th>
                <th className="p-3">Plan VENDIX</th>
                <th className="p-3">Estado Licencia</th>
                <th className="p-3">Límites (Users / Prods)</th>
                <th className="p-3">Registro</th>
                <th className="p-3 text-right">Acciones Auditadas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompanies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {c.plan || 'Starter'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      c.subscription_status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : c.subscription_status === 'trial'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {c.subscription_status?.toUpperCase() || 'TRIAL'}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-600">
                    {c.max_users || 5} usrs / {c.max_products || 500} prods
                  </td>
                  <td className="p-3 text-slate-500">{new Date(c.created_at || Date.now()).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleImpersonate(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      title="Entrar temporalmente en esta empresa de forma auditada"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Impersonar</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No hay empresas filtradas en el directorio VENDIX.
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
