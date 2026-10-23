'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';

export default function AddToCartClient03({ product, theme }: { product: any; theme?: any }) {
  const language = "en";
  const t = (key: any) => getTranslation(language || 'en', key);

  const hasVariants = Boolean(product?.hasVariants && Array.isArray(product?.variants) && product.variants.length > 0);

  const availableColors = React.useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(new Set(product.variants.map((v: any) => v.color?.trim()).filter(Boolean))) as string[];
  }, [hasVariants, product.variants]);

  const availableSizes = React.useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(new Set(product.variants.map((v: any) => v.size?.trim()).filter(Boolean))) as string[];
  }, [hasVariants, product.variants]);

  const [selectedColor, setSelectedColor] = useState<string>(() => availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(() => availableSizes[0] || '');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  // Find currently matched variant
  const matchedVariant = React.useMemo(() => {
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

  const primaryColor = theme?.primaryColor || '#10b981';
  const addToCartColor = theme?.buttonColors?.addToCart || primaryColor;
  const buyNowColor = theme?.buttonColors?.buyNow || '#ef4444';

  return (
    <div className="space-y-4 mb-4">
      {/* Color Selection */}
      {availableColors.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Color: <span className="text-white font-bold">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color: string) => {
              const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setSelectedColor(color); setQuantity(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {availableSizes.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Size: <span className="text-white font-bold">{selectedSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size: string) => {
              const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setSelectedSize(size); setQuantity(1); }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status indicator */}
      {hasVariants && (
        <div className="text-xs font-medium">
          {currentStock > 0 ? (
            <span className="text-emerald-400 font-semibold">
              ✓ In Stock ({currentStock} available)
            </span>
          ) : (
            <span className="text-rose-400 font-semibold">
              ✕ Out of stock for this variation
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <div className={`flex items-center border border-white/20 rounded-xl overflow-hidden h-11 w-32 bg-white/5 text-white ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <button onClick={isOutOfStock ? undefined : handleDecrease} disabled={isOutOfStock || quantity <= 1} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg disabled:cursor-not-allowed">-</button>
          <div className="flex-1 text-center text-sm font-semibold border-x border-white/10 py-2">{quantity}</div>
          <button onClick={isOutOfStock ? undefined : handleIncrease} disabled={isOutOfStock || quantity >= currentStock} className="w-9 h-full flex items-center justify-center hover:bg-white/10 transition-colors font-bold text-lg disabled:cursor-not-allowed">+</button>
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
    </div>
  );
}
