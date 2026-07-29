import React, { useState } from 'react';
import { Wallet, Lock, Unlock } from 'lucide-react';

export const CashRegisterModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openingBalance, setOpeningBalance] = useState('500.00');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Caja Registradora & Arqueo</h1>
        <p className="text-slate-400 text-sm">Apertura, movimientos de efectivo y cierres con diff tracking</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-slate-200 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Estado de Caja
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              Caja Abierta
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Monto Inicial</span>
              <span className="font-semibold text-slate-200">${openingBalance}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Ventas en Efectivo</span>
              <span className="font-semibold text-emerald-400">$3,420.00</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total Esperado en Caja</span>
              <span className="font-bold text-slate-100">$3,920.00</span>
            </div>
          </div>
          <button className="btn-danger w-full flex items-center justify-center gap-2 py-2.5">
            <Lock className="w-4 h-4" /> Realizar Arqueo & Cerrar Caja
          </button>
        </div>
      </div>
    </div>
  );
};
