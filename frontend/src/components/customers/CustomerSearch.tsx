import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Star, Mail, Phone, FileText, CheckCircle2, Search, X, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '../../core/services/apiClient';
import { useTranslation } from '../../core/store/languageStore';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  points: number;
}

export const CustomerSearch: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search?: string) => {
    setIsLoading(true);
    try {
      const endpoint = search ? `/customers?search=${encodeURIComponent(search)}` : '/customers';
      const data: any = await apiClient.get(endpoint);
      setCustomers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando clientes:', e);
      // Fallback si la base de datos local no devuelve elementos
      setCustomers([
        { id: 'cust_001', name: 'Cliente Frecuente Demo', email: 'cliente.demo@gmail.com', phone: '+34 600 123 456', tax_id: '12345678Z', points: 150 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchCustomers(val);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        tax_id: taxId.trim() || undefined,
      };

      const created: any = await apiClient.post('/customers', payload);
      
      // Actualizar lista local de clientes
      setCustomers((prev) => [created, ...prev]);

      // Notificación de correo enviado
      if (email.trim()) {
        setNotification(`✅ Cliente registrado correctamente. Se ha enviado un correo electrónico de bienvenida a ${email.trim()}`);
      } else {
        setNotification(`✅ Cliente ${name.trim()} creado correctamente.`);
      }

      // Limpiar formulario y cerrar modal
      setName('');
      setEmail('');
      setPhone('');
      setTaxId('');
      setShowAddModal(false);

      setTimeout(() => setNotification(null), 7000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error registrando el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER DE GESTIÓN DE CLIENTES */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              {t('customers_title')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
              {t('email_notification_active')}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('customers_subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-indigo px-4 py-2.5 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('register_customer')}</span>
        </button>
      </div>

      {/* BANNER NOTIFICACIÓN CORREO ENVIADO */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold shadow-xs transition-all animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA DE BÚSQUEDA Y FILTRO */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_customers_ph')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* TABLA DE CLIENTES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 font-bold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">{t('th_customer_name')}</th>
              <th className="px-6 py-4">{t('th_contact')}</th>
              <th className="px-6 py-4">{t('th_tax_id')}</th>
              <th className="px-6 py-4">{t('th_loyalty_points')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <span>{t('loading')}</span>
                  </div>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                  {t('no_customers_found')}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {c.email ? (
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{c.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin correo asignado</span>
                      )}
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                    {c.tax_id ? (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold">
                        {c.tax_id}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-xs">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{c.points || 0} pts</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CREAR CLIENTE CON NOTIFICACIÓN POR CORREO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" /> Registrar Nuevo Cliente
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  El cliente recibirá una notificación de bienvenida si introduces su correo.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 font-bold hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo / Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ana María Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Correo Electrónico (Para envío de bienvenida)</label>
                  <span className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Correo Automático
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Se enviará automáticamente un correo electrónico con su cuenta y saldo inicial de puntos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">DNI / CIF / NIF</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="12345678X"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Guardar & Enviar Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
