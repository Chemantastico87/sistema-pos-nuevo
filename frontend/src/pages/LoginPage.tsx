import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Building2, User, Globe, Coins, Clock, ShieldCheck, CheckCircle2, FileText, X } from 'lucide-react';
import { useAuthStore } from '../core/store/authStore';
import { apiClient } from '../core/services/apiClient';

export const LoginPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  const [hasExistingCompanies, setHasExistingCompanies] = useState<boolean | null>(null);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('España');
  const [currency, setCurrency] = useState('EUR');
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [selectedPlan, setSelectedPlan] = useState('Starter');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Modals & Pending Auth state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{ user: any; token: string; refreshToken?: string } | null>(null);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    apiClient.get('/auth/system-status')
      .then((res: any) => {
        setHasExistingCompanies(res.has_companies);
        if (res.has_companies) {
          setTab('login');
        } else {
          setTab('register');
        }
      })
      .catch(() => {
        setHasExistingCompanies(false);
      });
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res: any = await apiClient.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      setAuth(
        {
          id: res.user_id,
          company_id: res.company_id,
          company_name: loginEmail.split('@')[0] + ' Store',
          full_name: res.full_name,
          role: res.role,
          permissions: res.permissions || [],
          onboarding_completed: res.onboarding_completed,
          currency: res.currency,
          plan: res.plan,
          subscription_status: res.subscription_status,
        },
        res.access_token,
        res.refresh_token
      );
    } catch (err: any) {
      setError(err.message || 'Correo electrónico o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('Debe leer y aceptar los términos y condiciones de servicio.');
      setIsLoading(false);
      return;
    }

    const localUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
    const localCompId = `comp_${Math.random().toString(36).substring(2, 10)}`;
    
    const fallbackUserPayload = {
      id: localUserId,
      company_id: localCompId,
      company_name: companyName || 'Mi Empresa POS',
      full_name: ownerName || 'Administrador',
      role: 'admin',
      permissions: [
        'can_change_price', 'can_delete_sale', 'can_open_cash_register',
        'can_reopen_cash_register', 'can_view_profit', 'can_manage_inventory',
        'can_manage_users', 'can_manage_settings', 'can_export_reports'
      ],
      onboarding_completed: false,
      currency: currency,
      plan: selectedPlan,
      subscription_status: 'trial',
    };

    const fallbackToken = `token_${localUserId}`;

    try {
      const res: any = await apiClient.post('/auth/register-company', {
        company_name: companyName,
        owner_name: ownerName,
        email: registerEmail,
        password: registerPassword,
        confirm_password: confirmPassword,
        country,
        currency,
        timezone,
        plan: selectedPlan,
        terms_accepted: termsAccepted,
      });

      setPendingAuth({
        user: {
          id: res.user_id,
          company_id: res.company_id,
          company_name: companyName,
          full_name: res.full_name,
          role: res.role,
          permissions: res.permissions || [],
          onboarding_completed: false,
          currency: res.currency,
          plan: selectedPlan,
          subscription_status: res.subscription_status,
        },
        token: res.access_token,
        refreshToken: res.refresh_token,
      });
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOnboardingStart = () => {
    if (pendingAuth) {
      setAuth(pendingAuth.user, pendingAuth.token, pendingAuth.refreshToken);
    }
    setShowVerifyModal(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post('/auth/forgot-password', { email: forgotEmail });
      setSuccess('Si el correo electrónico existe en nuestra plataforma, hemos enviado las instrucciones de recuperación.');
    } catch (err: any) {
      setSuccess(`Instrucciones enviadas a ${forgotEmail}. Revise su bandeja de entrada.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden font-sans">
      {/* Luces de fondo estilo premium glassmorphism */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl p-8 rounded-3xl space-y-6 shadow-2xl relative z-10">
        
        {/* LOGOTIPO OFICIAL VENDIX: MONOGRAMA GEOMÉTRICO "V" (SIN RAYO) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
              <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1.6.8L16.5 18l-3.5 2.5a1 1 0 0 1-1.2 0L8.3 18l-2.9 2.8A1 1 0 0 1 3 20V4a1 1 0 0 1 1-1zm3 3v10.5l2-1.9a1 1 0 0 1 1.3 0l2.7 1.9 2.7-1.9a1 1 0 0 1 1.3 0l2 1.9V6H7zm2 3h6v2H9V9zm0 4h4v2H9v-2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-widest font-heading">
                VENDIX
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black tracking-widest uppercase shadow-xs">
                SaaS Commercial
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Plataforma TPV & Gestión Comercial Multi-Tenant v5.0
            </p>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900/60 rounded-xl text-xs font-bold border border-slate-700/50">
          <button
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg transition-all ${tab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg transition-all ${tab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Crear Empresa
          </button>
          <button
            onClick={() => { setTab('forgot'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg transition-all ${tab === 'forgot' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Recuperar
          </button>
          <button
            onClick={() => { setTab('verify'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-lg transition-all ${tab === 'verify' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            Verificar
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* TAB 1: INICIAR SESIÓN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="usuario@suempresa.com"
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Iniciando Sesión...' : 'Acceder a VENDIX POS'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: CREAR EMPRESA */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">1. Nombre Empresa</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Negocio S.L."
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">2. Nombre Propietario</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">3. Email Corporativo</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="admin@minegocio.com"
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">4. Contraseña</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">5. Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">6. País</label>
                <div className="relative">
                  <Globe className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="España">España</option>
                    <option value="México">México</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Chile">Chile</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">7. Moneda</label>
                <div className="relative">
                  <Coins className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="COP">COP ($)</option>
                    <option value="CLP">CLP ($)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">8. Zona Horaria</label>
                <div className="relative">
                  <Clock className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="America/Mexico_City">America/Mexico_City</option>
                    <option value="America/Bogota">America/Bogota</option>
                    <option value="America/Buenos_Aires">America/Buenos_Aires</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SELECCIÓN DE PLAN DE PAGO */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">9. Plan VENDIX Inicial (14 Días Gratis)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { name: 'Starter', price: '€19/m' },
                  { name: 'Profesional', price: '€39/m' },
                  { name: 'Business', price: '€79/m' },
                  { name: 'Enterprise', price: '€149/m' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    onClick={() => setSelectedPlan(p.name)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPlan === p.name
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] block">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold block">{p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* TÉRMINOS Y CONDICIONES */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-300 cursor-pointer">
                10. Acepto los{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-indigo-400 font-bold underline hover:text-indigo-300"
                >
                  Términos de Servicio VENDIX
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              <span>{isLoading ? 'Registrando...' : 'Crear Mi Empresa VENDIX POS'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: RECUPERAR CONTRASEÑA */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-400">
              Ingrese el correo electrónico con el que registró su empresa para recibir las instrucciones de recuperación.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@minegocio.com"
                  className="w-full bg-slate-900/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer"
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </button>
          </form>
        )}
      </div>

      {/* MODAL LECTURA DE TÉRMINOS Y CONDICIONES VENDIX */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Términos de Servicio VENDIX Commercial</h3>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <h4 className="font-bold text-white text-sm">1. Condición del Servicio VENDIX</h4>
              <p>
                Al registrar su empresa en VENDIX Commercial v5.0, usted obtiene una licencia operativa para la gestión de ventas TPV, control de inventario y facturación comercial.
              </p>

              <h4 className="font-bold text-white text-sm">2. Planes y Período de Prueba</h4>
              <p>
                Cada nueva empresa comienza con un período de prueba gratuito de 14 días en el plan seleccionado (Starter, Profesional, Business o Enterprise). Al finalizar, la cuenta pasará a modo de lectura protegida si no se confirma la renovación, garantizando que sus datos nunca serán eliminados.
              </p>

              <h4 className="font-bold text-white text-sm">3. Privacidad y Seguridad de Datos</h4>
              <p>
                Toda la información referente a sus ventas, inventario, clientes y cierres de caja se encuentra cifrada bajo arquitectura de aislamiento multi-tenant. No compartimos sus datos con terceros.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => { setTermsAccepted(true); setShowTermsModal(false); }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Entendido y Aceptar Términos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICACIÓN DE VERIFICACIÓN VENDIX */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">¡Empresa Registrada en VENDIX!</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Hemos enviado un correo electrónico de verificación a{' '}
                <span className="font-bold text-emerald-400 font-mono">{registerEmail || 'su correo corporativo'}</span>{' '}
                con los detalles de su plan <span className="font-bold text-indigo-400">{selectedPlan}</span> y su enlace de confirmación.
              </p>
            </div>

            <button
              onClick={handleConfirmOnboardingStart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Comenzar Asistente de Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
