'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';
import {
  getProductCardImageUrl,
  rememberLoadedProductImage,
  preloadProductMainImage,
} from '@/utils/imageOptimizer';
import { useProductTracker } from '@/hooks/useProductTracker';

export default function ProductCard06({
  product,
  isList = false,
  isBestSelling = false,
  badgeText,
  theme,
}: {
  product: any;
  isList?: boolean;
  isBestSelling?: boolean;
  badgeText?: string;
  theme?: any;
}) {
  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language || 'en', key);

  const { addToCart } = useCart();
  const router = useRouter();

  const imageUrl =
    product.images?.[0]?.secure_url ||
    product.image?.secure_url ||
    product.image ||
    '';
  const price = product.discountedPrice || product.originalPrice || product.price || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > price;
  const savePercent = hasDiscount
    ? Math.round(((product.originalPrice - price) / product.originalPrice) * 100)
    : 0;
  const productSlug = product.slug || product._id || product.id;
  const productId = product._id || product.id;

  const { trackRef, handleProductClick } = useProductTracker({
    productId,
    tenantId: product.tenantId,
    sourceSection: isBestSelling ? 'bestselling' : isList ? 'listing' : 'catalog',
  });

  const handleMouseEnter = () => {
    if (imageUrl) {
      rememberLoadedProductImage(imageUrl, getProductCardImageUrl(imageUrl));
      preloadProductMainImage(imageUrl);
    }
    try {
      router.prefetch(`/product/${productSlug}`);
    } catch {}
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      {
        id: productId,
        title: product.title || product.name,
        price,
        image: imageUrl,
        tenantId: product.tenantId || 'main',
      },
      1
    );
  };

  const isOutOfStock =
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.quantity === 'number' && product.quantity <= 0);

  // Dynamic badge resolution (Real data only & Merchant Dashboard Primary Color)
  const displayBadge = useMemo(() => {
    if (isOutOfStock) return language === 'bn' ? 'স্টকে নেই' : 'Out of Stock';
    if (hasDiscount) return language === 'bn' ? `${savePercent}% ছাড়` : `${savePercent}% OFF`;
    if (badgeText) return badgeText;
    if (product.badgeText) return product.badgeText;
    if (product.badge) return product.badge;
    if (isBestSelling) return language === 'bn' ? 'বেস্ট সেলার' : 'Best Seller';
    return '';
  }, [isOutOfStock, hasDiscount, savePercent, badgeText, product.badgeText, product.badge, isBestSelling, language]);

  if (isList) {
    return (
      <Link
        ref={trackRef}
        onClick={handleProductClick}
        prefetch={false}
        href={`/product/${productSlug}`}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleMouseEnter}
        className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-default"
      >
        <div className="w-full sm:w-56 aspect-[3/4] bg-[#F7F7F7] flex items-center justify-center shrink-0 overflow-hidden relative">
          {displayBadge && (
            <div
              style={{
                backgroundColor: theme?.primaryColor || '#111827',
                color: '#ffffff',
              }}
              className="absolute top-3 left-3 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md z-10 shadow-xs uppercase tracking-wider"
            >
              {displayBadge}
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
              <span className="bg-gray-900/90 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                Out of Stock
              </span>
            </div>
          )}
          {imageUrl ? (
            <img
              src={getProductCardImageUrl(imageUrl)}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onLoad={() => rememberLoadedProductImage(imageUrl, getProductCardImageUrl(imageUrl))}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
                isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
              }`}
            />
          ) : (
            <div className="text-gray-300 text-xs font-medium uppercase tracking-widest">No image</div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between">
          <div>
            {product.category?.name && (
              <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1 block">
                {product.category.name}
              </span>
            )}
            <h3 className="font-heading text-lg font-semibold text-gray-900 group-hover:text-black transition-colors line-clamp-2">
              {product.title || product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-900 text-lg">
                {theme?.currencySymbol || '৳'}{' '}{price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {theme?.currencySymbol || '৳'}{' '}{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <button
              onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
              disabled={isOutOfStock}
              className={`px-5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View (Default)
  return (
    <Link
      ref={trackRef}
      onClick={handleProductClick}
      prefetch={false}
      href={`/product/${productSlug}`}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handleMouseEnter}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-default"
    >
      {/* Image Container with portrait ratio */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-[#F7F7F7] rounded-2xl overflow-hidden border border-gray-100 group-hover:shadow-md transition-shadow">
        {/* Top-left pill badge (Merchant Dashboard Color) */}
        {displayBadge && (
          <div
            style={{
              backgroundColor: theme?.primaryColor || '#111827',
              color: '#ffffff',
            }}
            className="absolute top-2.5 left-2.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-md z-10 shadow-xs tracking-wide"
          >
            {displayBadge}
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
            <span className="bg-gray-900/90 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg border border-white/20">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image */}
        {imageUrl ? (
          <img
            src={getProductCardImageUrl(imageUrl)}
            alt={product.title || 'Product'}
            loading="lazy"
            decoding="async"
            onLoad={() => rememberLoadedProductImage(imageUrl, getProductCardImageUrl(imageUrl))}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
              isOutOfStock ? 'opacity-70 grayscale-[30%]' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium uppercase tracking-widest">
            No image
          </div>
        )}

        {/* Hover Quick Action Buttons */}
        <div className="absolute bottom-3 right-3 left-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white/95 backdrop-blur-md text-gray-900 hover:bg-black hover:text-white cursor-pointer'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="pt-3 pb-1 flex flex-col flex-1">
        {product.category?.name && (
          <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
            {product.category.name}
          </span>
        )}

        <h3 className="font-heading text-sm sm:text-base font-semibold text-gray-900 group-hover:text-black line-clamp-1 transition-colors">
          {product.title || product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-sm sm:text-base text-gray-900">
            {theme?.currencySymbol || '৳'}{' '}{price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {theme?.currencySymbol || '৳'}{' '}{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
