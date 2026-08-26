'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCard04({ product, isList = false, theme }: { product: any; isList?: boolean; theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const imageUrl = product.images?.[0]?.secure_url || product.image?.secure_url || product.image || '';
  const price = product.discountedPrice || product.originalPrice || product.price || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > price;
  const savePercent = hasDiscount
    ? Math.round(((product.originalPrice - price) / product.originalPrice) * 100)
    : 0;
  const productSlug = product.slug || product._id || product.id;
  const addToCartColor = theme?.buttonColors?.addToCart || theme?.primaryColor || '#111827';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      title: product.title || product.name,
      price,
      image: imageUrl,
      tenantId: product.tenantId || 'main',
    }, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    router.push('/checkout');
  };

  if (isList) {
    return (
      <Link href={`/product/${productSlug}`} className="group flex bg-white border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all rounded-2xl overflow-hidden cursor-default">
        <div className="w-40 h-40 bg-gray-50 flex items-center justify-center shrink-0 p-4">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-gray-300 text-xs">No image</div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-5 justify-center">
          <h4 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">{product.title || product.name}</h4>
          {product.shortDescription && <p className="text-sm text-gray-400 line-clamp-2 mb-3">{product.shortDescription}</p>}
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-900 text-lg">৳{price.toLocaleString()}</span>
            {hasDiscount && <span className="text-sm text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300">
      <Link href={`/product/${productSlug}`} className="block cursor-default">
        {/* Image */}
        <div className="relative bg-gray-50 aspect-square flex items-center justify-center p-6 overflow-hidden">
          {savePercent > 0 && (
            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
              -{savePercent}%
            </span>
          )}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title || product.name}
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-gray-200 text-sm">No image</div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/product/${productSlug}`} className="cursor-default">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[40px] hover:text-gray-600 transition-colors">
            {product.title || product.name}
          </h4>
        </Link>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-black text-gray-900 text-base">৳{price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart button - always visible, styled like the screenshot */}
        <button
          onClick={handleAddToCart}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          style={{ backgroundColor: addToCartColor }}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </button>
      </div>
    </div>
  );
}
