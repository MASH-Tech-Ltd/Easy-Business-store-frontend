'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { getTranslation } from '@/utils/translations';

export default function AddToCartClient({ product, theme }: { product: any; theme?: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useTranslation();

  const isOutOfStock = 
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.quantity === 'number' && product.quantity <= 0);

  const handleDecrease = () => { if (!isOutOfStock && quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (!isOutOfStock) setQuantity(quantity + 1); };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product._id || product.id,
      title: product.title,
      price: product.discountedPrice || product.price,
      image: product.images?.[0]?.secure_url || product.images?.[0]?.url || 'https://placehold.co/400',
      tenantId: product.tenantId || 'main',
    }, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push('/checkout');
  };

  const primaryColor = theme?.primaryColor || '#3b82f6';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div
        className={`flex items-center border rounded overflow-hidden h-10 w-28 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
        style={{ borderColor: addToCartColor, color: addToCartColor }}
      >
        <button onClick={isOutOfStock ? undefined : handleDecrease} disabled={isOutOfStock} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">-</button>
        <div className="flex-1 text-center text-sm font-semibold text-gray-900 border-x py-2" style={{ borderColor: addToCartColor }}>{quantity}</div>
        <button onClick={isOutOfStock ? undefined : handleIncrease} disabled={isOutOfStock} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">+</button>
      </div>
      <button
        onClick={isOutOfStock ? undefined : handleAddToCart}
        disabled={isOutOfStock}
        className={`text-white font-bold py-2.5 px-8 rounded text-sm shadow-md transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:shadow-lg hover:opacity-90 cursor-pointer'}`}
        style={!isOutOfStock ? { backgroundColor: addToCartColor } : { backgroundColor: '#6b7280' }}
      >
        {isOutOfStock ? 'Out of Stock' : t('addToCart')}
      </button>
      <button
        onClick={isOutOfStock ? undefined : handleBuyNow}
        disabled={isOutOfStock}
        className={`text-white font-bold py-2.5 px-8 rounded text-sm shadow-md transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:shadow-lg hover:opacity-90 cursor-pointer'}`}
        style={!isOutOfStock ? { backgroundColor: buyNowColor } : { backgroundColor: '#6b7280' }}
      >
        {isOutOfStock ? 'Out of Stock' : t('buyNow')}
      </button>
    </div>
  );
}
