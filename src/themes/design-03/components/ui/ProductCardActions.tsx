'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCardActions03({ product, theme }: { product: any; theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      title: product.title || product.name,
      price: product.discountedPrice || product.originalPrice || product.price,
      image: product.images?.[0]?.secure_url || product.image?.secure_url || 'https://placehold.co/400',
      tenantId: product.tenantId || 'main',
    }, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col gap-2 w-full bg-black/90 p-4 border border-white/20 backdrop-blur-md shadow-2xl">
      <button
        onClick={handleAddToCart}
        className="w-full text-white font-black py-2 px-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-[10px] uppercase tracking-[0.2em] text-center"
      >
        [ ADD TO DATABANK ]
      </button>
      <button
        onClick={handleBuyNow}
        className="w-full text-black font-black py-2 px-2 bg-cyan-400 border border-cyan-400 hover:bg-white hover:border-white transition-colors text-[10px] uppercase tracking-[0.2em] text-center"
      >
        [ INITIATE PURCHASE ]
      </button>
    </div>
  );
}
