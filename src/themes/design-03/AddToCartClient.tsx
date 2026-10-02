'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';

export default function AddToCartClient03({ product, theme }: { product: any; theme?: any }) {
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

  const primaryColor = theme?.primaryColor || '#10b981';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className={`flex items-center border border-white/20 rounded-xl overflow-hidden h-11 w-32 bg-white/5 text-white ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <button onClick={isOutOfStock ? undefined : handleDecrease} disabled={isOutOfStock} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg disabled:cursor-not-allowed">-</button>
        <div className="flex-1 text-center text-sm font-semibold border-x border-white/10 py-2">{quantity}</div>
        <button onClick={isOutOfStock ? undefined : handleIncrease} disabled={isOutOfStock} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg disabled:cursor-not-allowed">+</button>
      </div>
      <button
        onClick={isOutOfStock ? undefined : handleAddToCart}
        disabled={isOutOfStock}
        className={`text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'hover:opacity-90 cursor-pointer'}`}
        style={!isOutOfStock ? { backgroundColor: addToCartColor } : { backgroundColor: '#4b5563' }}
      >{isOutOfStock ? '[ OUT OF STOCK ]' : (t('addToCart') || 'Add to Cart')}</button>
      <button
        onClick={isOutOfStock ? undefined : handleBuyNow}
        disabled={isOutOfStock}
        className={`text-white font-bold py-3 px-8 rounded-xl text-sm shadow-lg transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'hover:opacity-90 cursor-pointer'}`}
        style={!isOutOfStock ? { backgroundColor: buyNowColor } : { backgroundColor: '#4b5563' }}
      >{isOutOfStock ? '[ OUT OF STOCK ]' : (t('buyNow') || 'Buy Now')}</button>
    </div>
  );
}
