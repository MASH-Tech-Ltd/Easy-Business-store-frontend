'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCardActions03({ product, theme }: { product: any; theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const isOutOfStock = 
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.quantity === 'number' && product.quantity <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
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
    if (isOutOfStock) return;
    handleAddToCart(e);
    router.push('/checkout');
  };

  const primaryColor = theme?.primaryColor || '#22d3ee';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || primaryColor;

  return (
    <div className="flex flex-col gap-2 w-full bg-black/90 p-4 border border-white/20 backdrop-blur-md shadow-2xl">
      <button
        onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full font-black py-2 px-2 border transition-all text-[10px] uppercase tracking-[0.2em] text-center ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-900 border-gray-700 text-gray-400' : 'text-white hover:opacity-90'}`}
        style={!isOutOfStock ? { backgroundColor: addToCartColor, borderColor: addToCartColor } : {}}
      >
        [ ADD TO DATABANK ]
      </button>
      <button
        onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleBuyNow}
        disabled={isOutOfStock}
        className={`w-full font-black py-2 px-2 border transition-all text-[10px] uppercase tracking-[0.2em] text-center ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-900 border-gray-700 text-gray-400' : 'text-white hover:opacity-90'}`}
        style={!isOutOfStock ? { backgroundColor: buyNowColor, borderColor: buyNowColor } : {}}
      >
        [ INITIATE PURCHASE ]
      </button>
    </div>
  );
}
