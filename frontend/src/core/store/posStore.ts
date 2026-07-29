import { create } from 'zustand';

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface POSState {
  cart: CartItem[];
  selectedCustomer: { id: string; name: string } | null;
  discount: number;
  paymentMethod: string;
  addToCart: (item: CartItem) => void;
  removeFromCart: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  setCustomer: (customer: { id: string; name: string } | null) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;
}

export const usePOSStore = create<POSState>((set) => ({
  cart: [],
  selectedCustomer: null,
  discount: 0,
  paymentMethod: 'cash',
  addToCart: (item) =>
    set((state) => {
      const existingIndex = state.cart.findIndex((i) => i.product_id === item.product_id);
      if (existingIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex].quantity += item.quantity;
        return { cart: updatedCart };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (product_id) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.product_id !== product_id),
    })),
  updateQuantity: (product_id, quantity) =>
    set((state) => ({
      cart: state.cart.map((i) => (i.product_id === product_id ? { ...i, quantity } : i)),
    })),
  setCustomer: (selectedCustomer) => set({ selectedCustomer }),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  clearCart: () => set({ cart: [], discount: 0, selectedCustomer: null }),
}));
