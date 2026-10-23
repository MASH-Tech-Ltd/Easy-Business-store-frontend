'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { trackEvent } from '@/utils/tracking';

export type CartItem = {
  id: string;
  productId?: string;
  variantId?: string;
  color?: string;
  size?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  tenantId: string;
  maxStock?: number;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('electronics_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart data', e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage whenever cart changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('electronics_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      const currentQty = existingItem ? existingItem.quantity : 0;
      const maxStock = typeof item.maxStock === 'number' ? item.maxStock : 999999;

      if (currentQty + quantity > maxStock) {
        toast.error(`Only ${maxStock} item(s) available in stock`);
        const cappedQty = Math.max(1, maxStock);
        if (existingItem) {
          return prev.map(i => i.id === item.id ? { ...i, quantity: cappedQty } : i);
        }
        return [...prev, { ...item, quantity: cappedQty }];
      }

      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
    trackEvent('add_to_cart', {
      id: item.id,
      title: item.title,
      price: item.price,
      quantity,
    });
    toast.success('Added to cart!');
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.info('Item removed from cart');
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        if (typeof item.maxStock === 'number' && quantity > item.maxStock) {
          toast.error(`Maximum available stock is ${item.maxStock}`);
          return { ...item, quantity: item.maxStock };
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      isInitialized
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
