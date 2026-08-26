import React from 'react';
import Link from 'next/link';
import ProductCardActions from './ProductCardActions';

interface ProductProps {
  product: any;
  isList?: boolean;
  theme?: any;
}

export default function Design02ProductCard({ product, isList = false, theme }: ProductProps) {
  const imageUrl = product.images?.[0]?.secure_url || product.image?.secure_url || product.image;

  if (isList) {
    return (
      <Link href={`/product/${product.slug || product._id || product.id}`} className="group flex bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 overflow-hidden relative w-full">
        <div className="w-48 h-48 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={product.title || product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Image</div>
          )}
        </div>
        <div className="p-6 flex flex-col justify-center flex-1">
          <h4 className="text-xl font-medium text-gray-900 group-hover:underline mb-2">{product.title || product.name}</h4>
          {product.shortDescription && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.shortDescription}</p>
          )}
          <div className="mt-auto flex items-center gap-4">
            <span className="font-semibold text-gray-900 text-lg">৳{product.discountedPrice || product.originalPrice || product.price}</span>
            {product.originalPrice > (product.discountedPrice || 0) && (
              <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.slug || product._id || product.id}`} className="group block">
      <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.title || product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}
        {product.originalPrice > (product.discountedPrice || 0) && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm">
            Sale
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-in-out bg-white/40 backdrop-blur-md border-t border-white/20 flex flex-col justify-end">
          <ProductCardActions product={product} theme={theme} />
        </div>
      </div>
      <h4 className="text-lg font-medium text-gray-900 group-hover:underline truncate">{product.title || product.name}</h4>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-semibold text-gray-900">৳{product.discountedPrice || product.originalPrice || product.price}</span>
        {product.originalPrice > (product.discountedPrice || 0) && (
          <span className="text-sm text-gray-400 line-through">৳{product.originalPrice}</span>
        )}
      </div>
    </Link>
  );
}
