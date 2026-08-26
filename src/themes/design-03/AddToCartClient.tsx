'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function AddToCartClient03({ product, theme }: { product: any; theme?: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleDecrease = () => { if (quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => setQuantity(quantity + 1);

  const handleAddToCart = () => {
    addToCart({
      id: product._id || product.id,
      title: product.title,
      price: product.discountedPrice || product.price,
      image: product.images?.[0]?.secure_url || product.images?.[0]?.url || 'https://placehold.co/400',
      tenantId: product.tenantId || 'main',
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const primaryColor = theme?.primaryColor || '#10b981';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center border border-white/20 rounded-xl overflow-hidden h-11 w-32 bg-white/5 text-white">
        <button onClick={handleDecrease} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg">-</button>
        <div className="flex-1 text-center text-sm font-semibold border-x border-white/10 py-2">{quantity}</div>
        <button onClick={handleIncrease} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg">+</button>
      </div>
      <button
        onClick={handleAddToCart}
        className="text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
        style={{ backgroundColor: addToCartColor }}
      >
        Add to Cart
      </button>
      <button
        onClick={handleBuyNow}
        className="text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
        style={{ backgroundColor: buyNowColor }}
      >
        Buy Now
      </button>
    </div>
  );
}
