import { create } from 'zustand';

interface CashRegister {
  id: string;
  name: string;
  status: 'open' | 'closed';
  opening_balance: number;
}

interface CashState {
  currentRegister: CashRegister | null;
  setRegister: (register: CashRegister | null) => void;
}

export const useCashStore = create<CashState>((set) => ({
  currentRegister: null,
  setRegister: (currentRegister) => set({ currentRegister }),
}));
