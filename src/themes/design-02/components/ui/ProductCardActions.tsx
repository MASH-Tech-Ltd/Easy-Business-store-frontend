'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCardActions({ product, theme }: { product: any, theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent the parent Link from navigating
    e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      title: product.title || product.name,
      price: product.discountedPrice || product.originalPrice || product.price,
      image: product.images?.[0]?.secure_url || product.image?.secure_url || product.image || 'https://placehold.co/400',
      tenantId: product.tenantId || 'main',
    }, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    router.push('/checkout');
  };

  const primaryColor = theme?.primaryColor || '#111827';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex gap-2 w-full">
      <button 
        onClick={handleAddToCart}
        className="flex-1 text-white font-medium py-1 px-1 rounded-sm shadow hover:opacity-90 transition-colors text-[10px] uppercase tracking-wider text-center"
        style={{ backgroundColor: addToCartColor }}
      >
        Add to Cart
      </button>
      <button 
        onClick={handleBuyNow}
        className="flex-1 text-white font-medium py-1 px-1 rounded-sm shadow hover:opacity-90 transition-colors text-[10px] uppercase tracking-wider text-center"
        style={{ backgroundColor: buyNowColor }}
      >
        Buy Now
      </button>
    </div>
  );
}
