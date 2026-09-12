'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductCard05({ product, isList = false, isBestSelling = false, theme }: { product: any; isList?: boolean; isBestSelling?: boolean; theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const imageUrl = product.images?.[0]?.secure_url || product.image?.secure_url || product.image || '';
  const price = product.discountedPrice || product.originalPrice || product.price || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > price;
  const savePercent = hasDiscount ? Math.round(((product.originalPrice - price) / product.originalPrice) * 100) : 0;
  const productSlug = product.slug || product._id || product.id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({
      id: product._id || product.id,
      title: product.title || product.name,
      price,
      image: imageUrl,
      tenantId: product.tenantId || 'main',
    }, 1);
  };

  if (isList) {
    return (
      <Link href={`/product/${productSlug}`} className="group flex bg-white rounded-2xl overflow-hidden hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200">
        <div className="w-48 h-48 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden mix-blend-multiply p-4">
          {imageUrl ? (
            <img src={imageUrl} alt={product.title} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-gray-300 text-xs font-medium uppercase tracking-widest">No image</div>
          )}
          {(isBestSelling && product.salesCount && product.salesCount > 30) && (
            <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1">
              🔥 {product.salesCount}+ Sold
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-6 justify-center">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{product.brand || 'Minimal'}</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">{product.title || product.name}</h4>
          {product.shortDescription && <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{product.shortDescription}</p>}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-semibold text-gray-900 text-xl">৳{price.toLocaleString()}</span>
            {hasDiscount && <span className="text-sm text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>}
          </div>
          <button onClick={handleAddToCart} 
            style={theme?.buttonColors?.addToCart ? { backgroundColor: theme.buttonColors.addToCart, borderColor: theme.buttonColors.addToCart, color: '#fff' } : {}}
            className="self-start px-6 py-2.5 bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-full hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all">
            Add to Cart
          </button>
        </div>
      </Link>
    );
  }

  return (
    <div className="group flex flex-col bg-white overflow-hidden transition-all duration-500">
      <Link href={`/product/${productSlug}`} className="block relative aspect-[4/5] bg-[#F8F9FA] rounded-2xl overflow-hidden mb-5">
        {savePercent > 0 && (
          <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10">
            Save {savePercent}%
          </span>
        )}
        {(isBestSelling && product.salesCount && product.salesCount > 30) && (
          <span className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full z-10 shadow-sm">
            🔥 {product.salesCount}+ Sold
          </span>
        )}
        {imageUrl ? (
          <img src={imageUrl} alt={product.title || product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium uppercase tracking-widest">No image</div>
        )}
        
        {/* Hover Add to Cart */}
        <div className="absolute inset-x-4 bottom-4 translate-y-0 opacity-100 md:translate-y-12 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button onClick={handleAddToCart} 
            style={theme?.buttonColors?.addToCart ? { backgroundColor: theme.buttonColors.addToCart, borderColor: theme.buttonColors.addToCart, color: '#fff' } : {}}
            className="w-full py-3.5 bg-white/90 backdrop-blur-md text-gray-900 text-sm font-semibold rounded-xl hover:bg-black hover:text-white transition-colors shadow-sm flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>
      </Link>

      <div className="flex flex-col px-1">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{product.brand || 'Minimal'}</div>
        <Link href={`/product/${productSlug}`}>
          <h4 className="text-[15px] font-medium text-gray-900 line-clamp-1 mb-2 hover:text-gray-600 transition-colors">
            {product.title || product.name}
          </h4>
        </Link>
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-gray-900 text-base">৳{price.toLocaleString()}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}
