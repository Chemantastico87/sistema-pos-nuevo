import { create } from 'zustand';

interface SettingsState {
  currency: string;
  currencySymbol: string;
  taxRate: number;
  companyName: string;
  taxId: string;
  phone: string;
  address: string;
  paperWidth: string;
  setSettings: (newSettings: Partial<SettingsState>) => void;
  formatMoney: (amount: number) => string;
}

const getSymbol = (curr: string) => {
  if (curr.includes('EUR') || curr.includes('€')) return '€';
  if (curr.includes('USD')) return 'US$';
  if (curr.includes('MXN')) return 'Mex$';
  return '$';
};

const initialCurrency = localStorage.getItem('pos_currency') || 'COP ($)';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: initialCurrency,
  currencySymbol: getSymbol(initialCurrency),
  taxRate: parseFloat(localStorage.getItem('pos_tax_rate') || '19'),
  companyName: localStorage.getItem('pos_company_name') || 'Mi Empresa S.A.S',
  taxId: localStorage.getItem('pos_tax_id') || '900.123.456-7',
  phone: localStorage.getItem('pos_phone') || '+57 300 123 4567',
  address: localStorage.getItem('pos_address') || 'Calle 100 # 15-20',
  paperWidth: localStorage.getItem('pos_paper_width') || '80mm',

  setSettings: (newSettings) => {
    if (newSettings.currency) {
      localStorage.setItem('pos_currency', newSettings.currency);
      newSettings.currencySymbol = getSymbol(newSettings.currency);
    }
    if (newSettings.taxRate !== undefined) localStorage.setItem('pos_tax_rate', newSettings.taxRate.toString());
    if (newSettings.companyName) localStorage.setItem('pos_company_name', newSettings.companyName);
    if (newSettings.taxId) localStorage.setItem('pos_tax_id', newSettings.taxId);
    if (newSettings.phone) localStorage.setItem('pos_phone', newSettings.phone);
    if (newSettings.address) localStorage.setItem('pos_address', newSettings.address);
    if (newSettings.paperWidth) localStorage.setItem('pos_paper_width', newSettings.paperWidth);

    set((state) => ({ ...state, ...newSettings }));
  },

  formatMoney: (amount: number) => {
    const symbol = get().currencySymbol;
    const formatted = Math.round(amount).toLocaleString('es-ES');
    return `${symbol}${formatted}`;
  },
}));
