import React from 'react';
import { Search, Wifi, WifiOff, Bell, ChevronDown, User, Zap } from 'lucide-react';
import { useAuthStore } from '../../core/store/authStore';
import { useTranslation } from '../../core/store/languageStore';
import { usePOSStore } from '../../core/store/posStore';
import { LanguageSelector } from '../common/LanguageSelector';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const { searchQuery, setSearchQuery } = usePOSStore();

  const isOfflineMode = typeof window !== 'undefined' && (!navigator.onLine || user?.id?.includes('offline'));

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-sans">
      {/* Search Input Bar with F2 Badge */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder={t('search_product_ph')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100/80 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all font-medium"
        />
        <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-slate-200 text-[10px] font-bold text-slate-600">
          F2
        </span>
      </div>

      {/* Right Controls Header */}
      <div className="flex items-center gap-4">
        {/* Badge Modo Offline */}
        {isOfflineMode && (
          <div className="bg-amber-500/10 border border-amber-500/40 text-amber-700 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold">
            <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">⚡ Modo Offline (Guardado Local)</span>
          </div>
        )}

        {/* Selector de Idioma */}
        <LanguageSelector variant="light" showLabel={true} />
        {/* Cash Register Badge */}
        <div className="bg-slate-100 border border-slate-200 hover:bg-slate-200/60 px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-700">Caja #1</span>
          <span className="text-[11px] text-emerald-600 font-bold">• {t('completed_badge')}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOfflineMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-emerald-600'}`}>
            {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
          </div>

          <div className="relative w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
              3
            </span>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 cursor-pointer" onClick={logout} title="Haz clic para cerrar sesión">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt="Admin User"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name || 'Admin'}</p>
              <p className="text-[11px] font-medium text-slate-500">{user?.role === 'admin' ? 'Administrador' : user?.role || 'Usuario'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
