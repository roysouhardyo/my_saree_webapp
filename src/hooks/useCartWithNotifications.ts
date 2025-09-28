'use client';

import { useCartStore, CartItem } from '@/store/cartStore';
import { useNotification } from '@/contexts/NotificationContext';

export const useCartWithNotifications = () => {
  const cartStore = useCartStore();
  const { addNotification } = useNotification();

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const existingItem = cartStore.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      const newQuantity = Math.min(existingItem.quantity + 1, item.stock);
      if (newQuantity > existingItem.quantity) {
        cartStore.addItem(item);
        addNotification({
          type: 'success',
          title: 'Quantity Updated',
          message: `${item.title} quantity increased to ${newQuantity}`,
          duration: 3000,
        });
      } else {
        addNotification({
          type: 'warning',
          title: 'Stock Limit Reached',
          message: `Cannot add more ${item.title}. Maximum stock reached.`,
          duration: 4000,
        });
      }
    } else {
      cartStore.addItem(item);
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${item.title} has been added to your cart`,
        duration: 3000,
        action: {
          label: 'View Cart',
          onClick: () => cartStore.openCart(),
        },
      });
    }
  };

  const removeItem = (id: string) => {
    const item = cartStore.items.find(cartItem => cartItem.id === id);
    if (item) {
      cartStore.removeItem(id);
      addNotification({
        type: 'info',
        title: 'Item Removed',
        message: `${item.title} has been removed from your cart`,
        duration: 3000,
      });
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartStore.items.find(cartItem => cartItem.id === id);
    if (!item) return;

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    const oldQuantity = item.quantity;
    cartStore.updateQuantity(id, quantity);
    
    if (quantity > oldQuantity) {
      addNotification({
        type: 'success',
        title: 'Quantity Increased',
        message: `${item.title} quantity updated to ${quantity}`,
        duration: 2000,
      });
    } else if (quantity < oldQuantity) {
      addNotification({
        type: 'info',
        title: 'Quantity Decreased',
        message: `${item.title} quantity updated to ${quantity}`,
        duration: 2000,
      });
    }
  };

  const clearCart = () => {
    const itemCount = cartStore.getTotalItems();
    if (itemCount > 0) {
      cartStore.clearCart();
      addNotification({
        type: 'info',
        title: 'Cart Cleared',
        message: `All ${itemCount} items have been removed from your cart`,
        duration: 3000,
      });
    }
  };

  return {
    ...cartStore,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};