import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product, CartItem } from '../types';
import { trackEvent } from '../analytics/core';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    trackEvent('add_to_cart', window.location.pathname, undefined, { product_id: product.id, quantity });
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...currentItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    trackEvent('remove_from_cart', window.location.pathname, undefined, { product_id: productId });
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const existingItem = items.find(i => i.product.id === productId);
    if (existingItem) {
      if (quantity > existingItem.quantity) {
        trackEvent('quantity_increase', window.location.pathname, undefined, { product_id: productId, new_quantity: quantity });
      } else if (quantity < existingItem.quantity) {
        trackEvent('quantity_decrease', window.location.pathname, undefined, { product_id: productId, new_quantity: quantity });
      }
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
