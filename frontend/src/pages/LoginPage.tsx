import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2, WifiOff, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../core/store/authStore';
import { VendixLogo } from '../components/common/VendixLogo';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useLanguageStore } from '../core/store/languageStore';
import { performOfflineCompanyLogin, getLatestSyncedCompany } from '../core/db/offlineAuthService';

export const LoginPage: React.FC = () => {
  const t = useLanguageStore((s) => s.t);
  const login = useAuthStore((s) => s.login);
  const registerCompany = useAuthStore((s) => s.registerCompany);

  // Estados de vista: 'login' | 'register' | 'forgot'
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');

  // Campos de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Campos de Registro de Empresa
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [country, setCountry] = useState('España');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Campos de Recuperación
  const [forgotEmail, setForgotEmail] = useState('');

  // Estados de interfaz
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [syncedCompanyExists, setSyncedCompanyExists] = useState(false);

  // Comprobar si existe al menos una empresa sincronizada localmente en DexieDB
  useEffect(() => {
    const checkSynced = async () => {
      const company = await getLatestSyncedCompany();
      setSyncedCompanyExists(!!company);
    };
    checkSynced();
  }, []);

  // Manejar Login Online
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().lowerCase ? email.trim().toLowerCase() : email.trim();
    if (!cleanEmail || !password) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanEmail, password);
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Login Offline Real con DexieDB
  const handleOfflineLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const synced = await performOfflineCompanyLogin(email);
      if (!synced) {
        setError('No existe ninguna empresa sincronizada localmente en este dispositivo.');
        return;
      }

      useAuthStore.setState({
        token: synced.offline_token,
        refreshToken: synced.offline_token,
        user: {
          id: synced.user_id,
          company_id: synced.company_id,
          email: synced.email,
          full_name: synced.full_name,
          role: synced.role,
          status: 'active',
          email_verified: true,
          permissions: ['*'],
          onboarding_completed: true,
          currency: synced.currency,
          plan: synced.plan,
          subscription_status: 'trial'
        },
        isAuthenticated: true,
        isOfflineMode: true
      });
    } catch (err: any) {
      setError('Error al acceder al almacenamiento local offline.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Registro Atómico de Empresa (60 Segundos)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones de uso.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await registerCompany({
        company_name: companyName,
        owner_name: ownerName,
        email: regEmail,
        password: regPassword,
        confirm_password: confirmPassword,
        currency,
        country,
        timezone: 'Europe/Madrid',
        terms_accepted: termsAccepted
      });
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Error al registrar la empresa');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Olvidé mi Contraseña
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!forgotEmail) {
      setError('Por favor ingresa tu correo electrónico.');
      return;
    }

    setIsLoading(true);
    try {
      await useAuthStore.getState().forgotPassword(forgotEmail);
      setSuccess('Si la cuenta existe, recibirás un mensaje con las instrucciones de recuperación.');
    } catch (err: any) {
      setError(typeof err === 'string' ? err : err.message || 'Error al solicitar recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A] text-slate-100 relative overflow-hidden font-sans">
      {/* Luces de fondo ambientales de precisión */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Selector de idioma flotante superior derecho */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSelector variant="dark" displayStyle="pills" />
      </div>

      {/* TARJETA UNIFICADA PREMIUM ESTILO STRIPE / LINEAR / CLERK */}
      <div className="w-full max-w-md bg-[#111827]/95 border border-slate-800/80 backdrop-blur-2xl p-8 rounded-3xl space-y-6 shadow-2xl relative z-10">
        
        {/* CABECERA PRINCIPAL CON ISOTIPO VENDIX */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <VendixLogo size="lg" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest font-heading">
              VENDIX
            </h1>
            <h2 className="text-lg font-bold text-slate-200 mt-1">
              {view === 'login' && 'Bienvenido a VENDIX'}
              {view === 'register' && 'Crear nueva Empresa'}
              {view === 'forgot' && 'Recuperar Contraseña'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {view === 'login' && 'La forma más rápida de gestionar tu negocio.'}
              {view === 'register' && 'Comienza tus 14 días de prueba gratuita sin tarjeta.'}
              {view === 'forgot' && 'Te enviaremos un enlace de restablecimiento seguro.'}
            </p>
          </div>
        </div>

        {/* MENSAJES DE ALERTA DE ERROR / ÉXITO */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* VISTA 1: FORMULARIO DE INICIO DE SESIÓN */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(null); setSuccess(null); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span className="text-xs font-medium text-slate-300">Recordarme</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-800/80 text-center space-y-3">
              <p className="text-xs text-slate-400">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(null); setSuccess(null); }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  Crear Empresa
                </button>
              </p>

              {/* BOTÓN OFFLINE SOLO SI EXISTE EMPRESA SINCRONIZADA */}
              {syncedCompanyExists && (
                <button
                  type="button"
                  onClick={handleOfflineLogin}
                  className="w-full py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                  Continuar sin Internet (Modo Local)
                </button>
              )}
            </div>
          </form>
        )}

        {/* VISTA 2: FORMULARIO DE REGISTRO DE EMPRESA (60 SEGUNDOS) */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre de la Empresa</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Mi Comercio S.L."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Propietario</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Carlos Gómez"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Correo Corporativo</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="contacto@micomercio.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Confirmar</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="MXN">MXN ($)</option>
                  <option value="COP">COP ($)</option>
                  <option value="CLP">CLP ($)</option>
                  <option value="ARS">ARS ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">País</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600"
              />
              <span className="text-[11px] text-slate-300">Acepto los términos de servicio y prueba de 14 días</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Crear Empresa y Empezar Vender</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccess(null); }}
                className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
              >
                ← Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

        {/* VISTA 3: RECUPERACIÓN DE CONTRASEÑA */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Ingresa tu correo registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Enviar Instrucciones</span>}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccess(null); }}
                className="text-xs text-slate-400 hover:text-white font-semibold transition-colors"
              >
                ← Volver al Inicio de Sesión
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
