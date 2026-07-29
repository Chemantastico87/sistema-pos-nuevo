import { create } from 'zustand';

export interface SaleRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  total: number;
  paymentMethod: string;
  items: Array<{ product_id: string; product_name: string; quantity: number; unit_price: number }>;
  status: 'completed' | 'cancelled';
}

interface CashState {
  isOpen: boolean;
  openingBalance: number;
  openedAt: string;
  cashSales: number;
  cardSales: number;
  mixedSales: number;
  deposits: number;
  withdrawals: number;
  salesHistory: SaleRecord[];
  openRegister: (balance: number) => void;
  closeRegister: () => void;
  addSaleRecord: (sale: SaleRecord) => void;
  cancelSaleRecord: (saleId: string) => void;
  addMovement: (type: 'deposit' | 'withdrawal', amount: number) => void;
}

export const useCashStore = create<CashState>((set, get) => ({
  isOpen: localStorage.getItem('pos_cash_open') === 'true' || true,
  openingBalance: parseFloat(localStorage.getItem('pos_opening_balance') || '50'),
  openedAt: localStorage.getItem('pos_opened_at') || new Date().toLocaleString('es-CO'),
  cashSales: parseFloat(localStorage.getItem('pos_cash_sales') || '120.50'),
  cardSales: parseFloat(localStorage.getItem('pos_card_sales') || '85.00'),
  mixedSales: parseFloat(localStorage.getItem('pos_mixed_sales') || '35.00'),
  deposits: parseFloat(localStorage.getItem('pos_deposits') || '0'),
  withdrawals: parseFloat(localStorage.getItem('pos_withdrawals') || '0'),
  salesHistory: JSON.parse(localStorage.getItem('pos_sales_history') || '[]'),

  openRegister: (balance) => {
    const now = new Date().toLocaleString('es-CO');
    localStorage.setItem('pos_cash_open', 'true');
    localStorage.setItem('pos_opening_balance', balance.toString());
    localStorage.setItem('pos_opened_at', now);
    localStorage.setItem('pos_cash_sales', '0');
    localStorage.setItem('pos_card_sales', '0');
    localStorage.setItem('pos_mixed_sales', '0');
    localStorage.setItem('pos_deposits', '0');
    localStorage.setItem('pos_withdrawals', '0');
    set({
      isOpen: true,
      openingBalance: balance,
      openedAt: now,
      cashSales: 0,
      cardSales: 0,
      mixedSales: 0,
      deposits: 0,
      withdrawals: 0,
    });
  },

  closeRegister: () => {
    localStorage.setItem('pos_cash_open', 'false');
    set({ isOpen: false });
  },

  addSaleRecord: (sale) => {
    const currentHistory = get().salesHistory;
    const updatedHistory = [sale, ...currentHistory];
    localStorage.setItem('pos_sales_history', JSON.stringify(updatedHistory));

    let cash = get().cashSales;
    let card = get().cardSales;
    let mixed = get().mixedSales;

    if (sale.paymentMethod === 'cash') cash += sale.total;
    else if (sale.paymentMethod === 'card') card += sale.total;
    else mixed += sale.total;

    localStorage.setItem('pos_cash_sales', cash.toString());
    localStorage.setItem('pos_card_sales', card.toString());
    localStorage.setItem('pos_mixed_sales', mixed.toString());

    set({
      salesHistory: updatedHistory,
      cashSales: cash,
      cardSales: card,
      mixedSales: mixed,
    });
  },

  cancelSaleRecord: (saleId) => {
    const updated = get().salesHistory.map((s) => (s.id === saleId ? { ...s, status: 'cancelled' as const } : s));
    localStorage.setItem('pos_sales_history', JSON.stringify(updated));
    set({ salesHistory: updated });
  },

  addMovement: (type, amount) => {
    if (type === 'deposit') {
      const d = get().deposits + amount;
      localStorage.setItem('pos_deposits', d.toString());
      set({ deposits: d });
    } else {
      const w = get().withdrawals + amount;
      localStorage.setItem('pos_withdrawals', w.toString());
      set({ withdrawals: w });
    }
  },
}));
