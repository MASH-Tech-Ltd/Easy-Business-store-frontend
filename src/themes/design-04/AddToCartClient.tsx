'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';

export default function AddToCartClient({ product, theme }: { product: any; theme?: any }) {
  const language = "en";
  const t = (key: any) => getTranslation(language || 'en', key);

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

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

  const primaryColor = theme?.primaryColor || '#111827';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || primaryColor;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className={`flex items-center border border-gray-200 rounded-xl overflow-hidden h-11 w-32 bg-white text-gray-900 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}>
        <button onClick={isOutOfStock ? undefined : handleDecrease} disabled={isOutOfStock} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">-</button>
        <div className="flex-1 text-center text-sm font-semibold border-x border-gray-200 py-2">{quantity}</div>
        <button onClick={isOutOfStock ? undefined : handleIncrease} disabled={isOutOfStock} className="w-9 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">+</button>
      </div>
      <button
        onClick={isOutOfStock ? undefined : handleAddToCart}
        disabled={isOutOfStock}
        style={!isOutOfStock ? { backgroundColor: addToCartColor } : { backgroundColor: '#6b7280' }}
        className={`text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:opacity-90 cursor-pointer'}`}
      >{isOutOfStock ? 'Out of Stock' : (t('addToCart') || 'Add to Cart')}</button>
      <button
        onClick={isOutOfStock ? undefined : handleBuyNow}
        disabled={isOutOfStock}
        style={!isOutOfStock ? { backgroundColor: buyNowColor } : { backgroundColor: '#6b7280' }}
        className={`text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'hover:opacity-90 cursor-pointer'}`}
      >{isOutOfStock ? 'Out of Stock' : (t('buyNow') || 'Buy Now')}</button>
    </div>
  );
}
