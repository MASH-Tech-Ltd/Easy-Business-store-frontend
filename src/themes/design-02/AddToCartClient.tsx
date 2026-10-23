'use client';

import React, { useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { getTranslation } from '@/utils/translations';

export default function AddToCartClient({ product, theme }: { product: any; theme?: any }) {
  const hasVariants = Boolean(product?.hasVariants && Array.isArray(product?.variants) && product.variants.length > 0);

  const availableColors = useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(new Set(product.variants.map((v: any) => v.color?.trim()).filter(Boolean))) as string[];
  }, [hasVariants, product.variants]);

  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(new Set(product.variants.map((v: any) => v.size?.trim()).filter(Boolean))) as string[];
  }, [hasVariants, product.variants]);

  const [selectedColor, setSelectedColor] = useState<string>(() => availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(() => availableSizes[0] || '');
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const router = useRouter();
  const { t } = useTranslation();

  // Find currently matched variant
  const matchedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants.find((v: any) => {
      const matchColor = !availableColors.length || (v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase());
      const matchSize = !availableSizes.length || (v.size?.trim().toLowerCase() === selectedSize.trim().toLowerCase());
      return matchColor && matchSize;
    }) || null;
  }, [hasVariants, product.variants, selectedColor, selectedSize, availableColors.length, availableSizes.length]);

  const currentStock = hasVariants
    ? (matchedVariant ? Number(matchedVariant.stock) || 0 : 0)
    : (typeof product.stock === 'number' ? product.stock : 999);

  const isOutOfStock = 
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    currentStock <= 0;

  const handleDecrease = () => { if (!isOutOfStock && quantity > 1) setQuantity(quantity - 1); };
  const handleIncrease = () => { if (!isOutOfStock && quantity < currentStock) setQuantity(quantity + 1); };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItemId = matchedVariant?._id
      ? `${product._id || product.id}-${matchedVariant._id}`
      : `${product._id || product.id}${selectedColor ? `-${selectedColor}` : ''}${selectedSize ? `-${selectedSize}` : ''}`;

    addToCart({
      id: cartItemId,
      productId: product._id || product.id,
      variantId: matchedVariant?._id,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      title: product.title,
      price: product.discountedPrice || product.price,
      image: product.images?.[0]?.secure_url || product.images?.[0]?.url || 'https://placehold.co/400',
      tenantId: product.tenantId || 'main',
      maxStock: currentStock,
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
    <div className="space-y-5 mb-4">
      {/* Color Selector */}
      {availableColors.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Color: <strong className="text-gray-900">{selectedColor}</strong></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color: string) => {
              const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setSelectedColor(color); setQuantity(1); }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Size: <strong className="text-gray-900">{selectedSize}</strong></span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size: string) => {
              const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setSelectedSize(size); setQuantity(1); }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock availability banner when variants enabled */}
      {hasVariants && (
        <div className="text-xs font-medium">
          {currentStock > 0 ? (
            <span className="text-emerald-600 flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              In Stock ({currentStock} available)
            </span>
          ) : (
            <span className="text-rose-500 flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Out of Stock for this selection
            </span>
          )}
        </div>
      )}

      {/* Quantity & Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex items-center border rounded overflow-hidden h-10 w-28 ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
          style={{ borderColor: addToCartColor, color: addToCartColor }}
        >
          <button onClick={isOutOfStock ? undefined : handleDecrease} disabled={isOutOfStock || quantity <= 1} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">-</button>
          <div className="flex-1 text-center text-sm font-semibold text-gray-900 border-x py-2" style={{ borderColor: addToCartColor }}>{quantity}</div>
          <button onClick={isOutOfStock ? undefined : handleIncrease} disabled={isOutOfStock || quantity >= currentStock} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-lg disabled:cursor-not-allowed">+</button>
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
    </div>
  );
}
