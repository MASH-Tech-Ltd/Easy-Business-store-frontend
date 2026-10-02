'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';

export default function ProductCardActions({ product, theme }: { product: any, theme?: any }) {
  const language = "en";
  const t = (key: any) => getTranslation(language || 'en', key);

  const { addToCart } = useCart();
  const router = useRouter();

  const isOutOfStock = 
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.quantity === 'number' && product.quantity <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent the parent Link from navigating
    e.stopPropagation();
    if (isOutOfStock) return;
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
    if (isOutOfStock) return;
    handleAddToCart(e);
    router.push('/checkout');
  };

  const primaryColor = theme?.primaryColor || '#111827';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button 
        onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
        disabled={isOutOfStock}
        className={`flex-1 font-medium py-1.5 px-1 sm:py-1 rounded-sm shadow transition-all text-[9px] sm:text-[10px] uppercase tracking-wider text-center leading-tight ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'text-white hover:opacity-90'}`}
        style={!isOutOfStock ? { backgroundColor: addToCartColor } : {}}
      >{t('addToCart') || 'Add to Cart'}</button>
      <button 
        onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleBuyNow}
        disabled={isOutOfStock}
        className={`flex-1 font-medium py-1.5 px-1 sm:py-1 rounded-sm shadow transition-all text-[9px] sm:text-[10px] uppercase tracking-wider text-center leading-tight ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'text-white hover:opacity-90'}`}
        style={!isOutOfStock ? { backgroundColor: buyNowColor } : {}}
      >{t('buyNow') || 'Buy Now'}</button>
    </div>
  );
}
