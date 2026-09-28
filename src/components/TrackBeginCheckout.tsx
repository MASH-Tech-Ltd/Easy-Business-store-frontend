'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/utils/tracking';
import { useCart } from '@/context/CartContext';

export default function TrackBeginCheckout() {
  const { cartItems, totalPrice } = useCart();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current && cartItems && cartItems.length > 0) {
      hasTracked.current = true;
      trackEvent('begin_checkout', {
        value: totalPrice,
        currency: 'BDT',
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      });
    }
  }, [cartItems, totalPrice]);

  return null;
}
