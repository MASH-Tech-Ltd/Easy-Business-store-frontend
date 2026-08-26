'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function AddToCartClient({ product }: { product: any }) {
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

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-11 w-32 bg-white text-gray-900">
        <button onClick={handleDecrease} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg">-</button>
        <div className="flex-1 text-center text-sm font-semibold border-x border-gray-200 py-2">{quantity}</div>
        <button onClick={handleIncrease} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg">+</button>
      </div>
      <button
        onClick={handleAddToCart}
        className="bg-black text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
      >
        Add to Cart
      </button>
      <button
        onClick={handleBuyNow}
        className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg hover:opacity-90 transition-all cursor-pointer"
      >
        Buy Now
      </button>
    </div>
  );
}
