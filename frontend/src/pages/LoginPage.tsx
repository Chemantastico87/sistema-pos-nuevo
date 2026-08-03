import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, ArrowRight, Building2, User, Globe, Coins, Clock,
  ShieldCheck, CheckCircle2, FileText, X, Eye, EyeOff, Sparkles, KeyRound, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../core/store/authStore';
import { useTranslation } from '../core/store/languageStore';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { apiClient } from '../core/services/apiClient';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'verify'>('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem('vendix_saved_email') || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);

  // Register state
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [country, setCountry] = useState('España');
  const [currency, setCurrency] = useState('EUR');
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [selectedPlan, setSelectedPlan] = useState('Starter');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Modals & Auth state
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingAuth, setPendingAuth] = useState<{ user: any; token: string; refreshToken?: string } | null>(null);

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newForgotPass, setNewForgotPass] = useState('');
  const [confirmForgotPass, setConfirmForgotPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    // Comprobar estado inicial del sistema de forma silenciosa
    apiClient.get('/auth/system-status')
      .then((res: any) => {
        if (!res.has_companies) {
          setTab('register');
        }
      })
      .catch(() => null);
  }, []);

  // Demo Login Rápido (1-Click)
  const handleQuickDemoLogin = (role: 'admin' | 'cashier' | 'supervisor') => {
    const credentials = {
      admin: { email: 'admin@vendixpos.com', pass: 'admin123', name: 'Administrador Demo' },
      cashier: { email: 'cajero@vendixpos.com', pass: 'cajero123', name: 'Carlos Cajero' },
      supervisor: { email: 'supervisor@vendixpos.com', pass: 'super123', name: 'María Supervisora' },
    }[role];

    setLoginEmail(credentials.email);
    setLoginPassword(credentials.pass);
    executeLogin(credentials.email, credentials.pass);
  };

  const executeLogin = async (emailVal: string, passVal: string) => {
    setIsLoading(true);
    setError(null);

    // Guardar correo si la opción Recordarme está activa
    if (rememberEmail && emailVal) {
      localStorage.setItem('vendix_saved_email', emailVal);
    } else {
      localStorage.removeItem('vendix_saved_email');
    }

    try {
      // Intentar inicio de sesión contra el Backend API (Sin fallbacks locales)
      const res: any = await apiClient.post('/auth/login', {
        email: emailVal,
        password: passVal,
      });

      if (res.status === 'pending_email' || res.email_verified === false) {
        setRegisterEmail(emailVal);
        setPendingAuth({
          user: {
            id: res.user_id,
            company_id: res.company_id,
            full_name: res.full_name,
            role: res.role,
            permissions: res.permissions || [],
            status: 'pending_email',
            email_verified: false
          },
          token: res.access_token,
          refreshToken: res.refresh_token
        });
        setShowVerifyModal(true);
        return;
      }

      setAuth(
        {
          id: res.user_id,
          company_id: res.company_id,
          company_name: emailVal.split('@')[0].toUpperCase() + ' POS Store',
          full_name: res.full_name,
          role: res.role,
          status: res.status || 'active',
          email_verified: res.email_verified ?? true,
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
      setError(err.message || t('errors.invalid_credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError(t('validation.required_field'));
      return;
    }
    executeLogin(loginEmail, loginPassword);
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

    if (registerPassword.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres e incluir mayúscula, minúscula, número y símbolo.');
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError(t('validation.terms_required'));
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await apiClient.post('/auth/register', {
        company_name: companyName,
        owner_name: ownerName,
        email: registerEmail,
        password: registerPassword,
        confirm_password: confirmPassword,
        country,
        currency,
        timezone,
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
          onboarding_completed: true,
          currency: res.currency,
          plan: selectedPlan,
          subscription_status: res.subscription_status,
        },
        token: res.access_token,
        refreshToken: res.refresh_token,
      });
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la empresa. Por favor verifique los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOnboardingStart = (skipWizard: boolean = false) => {
    if (pendingAuth) {
      const userToSet = {
        ...pendingAuth.user,
        onboarding_completed: skipWizard ? true : pendingAuth.user.onboarding_completed,
      };
      setAuth(userToSet, pendingAuth.token, pendingAuth.refreshToken);
      if (skipWizard) {
        apiClient.put('/auth/company-settings', { onboarding_completed: true }).catch(() => null);
      }
    }
    setShowVerifyModal(false);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!forgotEmail || !newForgotPass || !confirmForgotPass) {
      setError('Por favor complete todos los campos.');
      setIsLoading(false);
      return;
    }

    if (newForgotPass !== confirmForgotPass) {
      setError('Las contraseñas ingresadas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (newForgotPass.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres (incluyendo mayúscula, minúscula, número y símbolo).');
      setIsLoading(false);
      return;
    }

    try {
      const res: any = await apiClient.post('/auth/direct-reset-password', {
        email: forgotEmail,
        new_password: newForgotPass,
        confirm_password: confirmForgotPass,
      });

      setSuccess(res.message || 'Contraseña actualizada exitosamente. Iniciando sesión...');
      setLoginEmail(forgotEmail);
      setLoginPassword(newForgotPass);

      setTimeout(() => {
        executeLogin(forgotEmail, newForgotPass);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'No se pudo restablecer la contraseña. Verifique que el correo esté registrado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      {/* Fondos dinámicos en gradiente con efecto glassmorphism */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-2xl p-8 rounded-3xl space-y-6 shadow-2xl relative z-10">
        
        {/* SELECTOR DE IDIOMA PRE-LOGIN EN BANDERAS VISIBLES */}
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">{t('language')}:</span>
          </div>
          <LanguageSelector variant="dark" displayStyle="pills" />
        </div>

        {/* CABECERA CON BRANDING DE VENDIX */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
            <svg className="w-9 h-9 text-white fill-current" viewBox="0 0 24 24">
              <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1.6.8L16.5 18l-3.5 2.5a1 1 0 0 1-1.2 0L8.3 18l-2.9 2.8A1 1 0 0 1 3 20V4a1 1 0 0 1 1-1zm3 3v10.5l2-1.9a1 1 0 0 1 1.3 0l2.7 1.9 2.7-1.9a1 1 0 0 1 1.3 0l2 1.9V6H7zm2 3h6v2H9V9zm0 4h4v2H9v-2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-widest font-heading">
                VENDIX
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black tracking-widest uppercase shadow-xs">
                POS SaaS Commercial
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* BOTONES DE INICIO DE SESIÓN RÁPIDO (DEMO 1-CLICK) */}
        <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" /> {t('quick_access')}
            </span>
            <span>{t('select_profile')}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 rounded-xl text-indigo-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              {t('admin_profile')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('supervisor')}
              className="py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 rounded-xl text-blue-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              {t('supervisor_profile')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('cashier')}
              className="py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold transition-all text-center cursor-pointer"
            >
              {t('cashier_profile')}
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN ENTRE PESTAÑAS */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/90 rounded-2xl text-xs font-bold border border-slate-800">
          <button
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${tab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {t('login_tab')}
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${tab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {t('register_tab')}
          </button>
          <button
            onClick={() => { setTab('forgot'); setError(null); setSuccess(null); }}
            className={`py-2 rounded-xl transition-all cursor-pointer ${tab === 'forgot' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            {t('forgot_tab')}
          </button>
        </div>

        {/* MENSAJES DE ERROR / ÉXITO */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* PESTAÑA 1: INICIO DE SESIÓN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@vendixpos.com"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-3 text-xs text-white outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {t('password_label')}
                </label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {t('forgot_link')}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-2xl pl-10 pr-10 py-3 text-xs text-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t('remember_me')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? t('logging_in') : t('access_btn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PESTAÑA 2: CREAR EMPRESA */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre Empresa *</label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Negocio S.L."
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Propietario *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Juan Pérez"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email Corporativo (Recibirá Confirmación) *</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="admin@minegocio.com"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Confirmar Contraseña *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">País</label>
                <div className="relative">
                  <Globe className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
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
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Moneda</label>
                <div className="relative">
                  <Coins className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
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
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Zona Horaria</label>
                <div className="relative">
                  <Clock className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white outline-none"
                  >
                    <option value="Europe/Madrid">Europe/Madrid</option>
                    <option value="America/Mexico_City">America/Mexico_City</option>
                    <option value="America/Bogota">America/Bogota</option>
                    <option value="America/Buenos_Aires">America/Buenos_Aires</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Plan VENDIX Inicial (14 Días Prueba)</label>
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
                        : 'bg-slate-950/60 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-[11px] block">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold block">{p.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-300 cursor-pointer">
                Acepto los{' '}
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Creando Empresa...' : 'Crear Mi Empresa VENDIX POS'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* PESTAÑA 3: RECUPERAR / RESTABLECER CONTRASEÑA */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-3 font-sans">
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresa el correo electrónico de tu cuenta y define tu nueva contraseña de acceso.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Correo Electrónico Registrado *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@minegocio.com"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Nueva Contraseña * (Mínimo 12 caracteres, Mayúscula, Minúscula, Número y Símbolo)
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showForgotPass ? 'text' : 'password'}
                  required
                  value={newForgotPass}
                  onChange={(e) => setNewForgotPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-9 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowForgotPass(!showForgotPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showForgotPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showForgotPass ? 'text' : 'password'}
                  required
                  value={confirmForgotPass}
                  onChange={(e) => setConfirmForgotPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Actualizando...' : 'Restablecer Contraseña e Iniciar Sesión'}</span>
            </button>
          </form>
        )}
      </div>

      {/* MODAL LECTURA TÉRMINOS Y CONDICIONES */}
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
                Cada nueva empresa comienza con un período de prueba gratuito de 14 días en el plan seleccionado (Starter, Profesional, Business o Enterprise). Al finalizar, la cuenta pasará a modo de lectura protegida si no se confirma la renovación.
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

      {/* MODAL CONFIRMACIÓN DE REGISTRO & NOTIFICACIÓN EMAIL */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">¡Empresa Creada en VENDIX POS!</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Se ha enviado un correo electrónico de bienvenida con las credenciales de tu plan <span className="font-bold text-indigo-400">{selectedPlan}</span> a{' '}
                <span className="font-bold text-emerald-400 font-mono">{registerEmail || 'su correo corporativo'}</span>.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleConfirmOnboardingStart(true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ingresar al Panel TPV Directamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleConfirmOnboardingStart(false)}
                className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Asistente de Configuración Inicial (8 Pasos)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
