'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';

export default function AddToCartClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useTranslation();

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

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
      <div className="flex items-center border border-[#7c3aed] rounded overflow-hidden h-10 w-28 text-[#7c3aed]">
        <button 
          onClick={handleDecrease}
          className="w-8 h-full flex items-center justify-center hover:bg-[#f9f5ff] transition-colors font-bold text-lg"
        >
          -
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-gray-900 border-x border-[#7c3aed] py-2">
          {quantity}
        </div>
        <button 
          onClick={handleIncrease}
          className="w-8 h-full flex items-center justify-center hover:bg-[#f9f5ff] transition-colors font-bold text-lg"
        >
          +
        </button>
      </div>
      <button 
        onClick={handleAddToCart}
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-2.5 px-8 rounded text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        {t('addToCart')}
      </button>
      <button 
        onClick={handleBuyNow}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
      >
        {t('buyNow')}
      </button>
    </div>
  );
}
