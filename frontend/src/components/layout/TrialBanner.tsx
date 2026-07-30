import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../core/store/authStore';

interface TrialBannerProps {
  onOpenSubscriptions: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ onOpenSubscriptions }) => {
  const user = useAuthStore((s) => s.user);

  if (!user || user.subscription_status !== 'trial') {
    return null;
  }

  // Simulación del cálculo de días de prueba restantes (14 días base)
  const daysRemaining = 12;
  const progressPercent = Math.min(100, Math.max(5, (daysRemaining / 14) * 100));

  return (
    <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-slate-900 border-b border-indigo-500/30 px-4 py-2 text-white flex items-center justify-between gap-4 text-xs font-sans relative z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Trial VENDIX</span>
        </div>
        <span className="font-semibold text-slate-200">
          Quedan <strong className="text-white font-bold">{daysRemaining} días</strong> de prueba gratuita en tu plan <span className="text-indigo-300 font-bold">{user.plan || 'Starter'}</span>.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 w-36">
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono font-bold">{daysRemaining}d</span>
        </div>

        <button
          onClick={onOpenSubscriptions}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-[11px] shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>Actualizar Plan</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
