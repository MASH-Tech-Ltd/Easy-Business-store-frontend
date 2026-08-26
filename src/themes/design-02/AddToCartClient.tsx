'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';

export default function AddToCartClient({ product, theme }: { product: any; theme?: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useTranslation();

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

  const primaryColor = theme?.primaryColor || '#3b82f6';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div
        className="flex items-center border rounded overflow-hidden h-10 w-28"
        style={{ borderColor: addToCartColor, color: addToCartColor }}
      >
        <button onClick={handleDecrease} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg">-</button>
        <div className="flex-1 text-center text-sm font-semibold text-gray-900 border-x py-2" style={{ borderColor: addToCartColor }}>{quantity}</div>
        <button onClick={handleIncrease} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg">+</button>
      </div>
      <button
        onClick={handleAddToCart}
        className="text-white font-bold py-2.5 px-8 rounded text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all cursor-pointer"
        style={{ backgroundColor: addToCartColor }}
      >
        {t('addToCart')}
      </button>
      <button
        onClick={handleBuyNow}
        className="text-white font-bold py-2.5 px-8 rounded text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all cursor-pointer"
        style={{ backgroundColor: buyNowColor }}
      >
        {t('buyNow')}
      </button>
    </div>
  );
}
