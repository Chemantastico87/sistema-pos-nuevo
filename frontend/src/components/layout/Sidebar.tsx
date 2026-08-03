import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, Monitor, Package, Users, Warehouse, 
  Wallet, BarChart3, Receipt, UserCheck, Settings, BookOpen, Bot,
  ShieldCheck, CreditCard, Database, Activity, HelpCircle, AlertOctagon, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../core/store/authStore';
import { useTranslation } from '../../core/store/languageStore';
import { LanguageSelector } from '../common/LanguageSelector';
import { VendixLogo } from '../common/VendixLogo';

export const Sidebar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', label: t('nav_insights'), icon: Home },
    { to: '/', label: t('nav_pos'), icon: Monitor },
    { to: '/products', label: t('nav_products'), icon: Package },
    { to: '/customers', label: t('nav_customers'), icon: Users },
    { to: '/inventory', label: t('nav_inventory'), icon: Warehouse },
    { to: '/cash', label: t('nav_cash'), icon: Wallet },
    { to: '/sales', label: t('nav_daily_sales'), icon: Receipt },
    { to: '/reports', label: t('nav_reports'), icon: BarChart3 },
    { to: '/tickets', label: t('nav_tickets'), icon: Receipt },
    { to: '/users', label: t('nav_users'), icon: UserCheck },
    { to: '/subscriptions', label: t('nav_subscriptions'), icon: CreditCard },
    { to: '/backups', label: t('nav_backups'), icon: Database },
    { to: '/help-center', label: t('nav_help'), icon: BookOpen },
    { to: '/vendix-assistant', label: t('nav_assistant'), icon: Bot },
    { to: '/diagnostics', label: t('nav_diagnostics'), icon: Activity },
    { to: '/help', label: 'Soporte & Roadmap', icon: HelpCircle },
    { to: '/settings', label: t('nav_settings'), icon: Settings },
  ];

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    navItems.unshift({ to: '/superadmin', label: 'VENDIX Cloud', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-4 shadow-2xl z-20 shrink-0 select-none border-r border-slate-800/80 font-sans">
      <div className="space-y-6">
        {/* LOGOTIPO OFICIAL VENDIX */}
        <div className="space-y-3 px-1">
          <VendixLogo size="md" badgeText="SaaS PRO" />

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="font-bold text-slate-200 truncate">{user?.company_name || 'Mi Empresa POS'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-400 font-bold uppercase">{user?.plan || 'Starter'}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-22rem)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="space-y-3 pt-3 border-t border-slate-900">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('language')}</p>
            <LanguageSelector variant="dark" showLabel={true} direction="up" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 animate-ping absolute" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
