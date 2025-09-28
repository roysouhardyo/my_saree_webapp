import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  vendor: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === newItem.id);

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = Math.min(existingItem.quantity + 1, newItem.stock);
          set({
            items: items.map(item =>
              item.id === newItem.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Add new item to cart
          set({
            items: [...items, { ...newItem, quantity: 1 }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);