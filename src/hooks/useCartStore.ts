import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCartOpen: false,
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(
          item => item.product.id === newItem.product.id && item.selectedSize === newItem.selectedSize
        );
        
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item === existingItem 
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          };
        }
        return { items: [...state.items, newItem] };
      }),
      removeItem: (productId, size) => set((state) => ({
        items: state.items.filter(item => !(item.product.id === productId && item.selectedSize === size))
      })),
      clearCart: () => set({ items: [] }),
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
    }),
    {
      name: 'sultans-thread-cart',
    }
  )
);
