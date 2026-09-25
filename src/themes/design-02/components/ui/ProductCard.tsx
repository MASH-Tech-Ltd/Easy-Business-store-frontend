import React from "react";
import Link from "next/link";
import ProductCardActions from "./ProductCardActions";

interface ProductProps {
  product: any;
  isList?: boolean;
  isBestSelling?: boolean;
  theme?: any;
}

export default function Design02ProductCard({
  product,
  isList = false,
  isBestSelling = false,
  theme,
}: ProductProps) {
  const imageUrl =
    product.images?.[0]?.secure_url ||
    product.image?.secure_url ||
    product.image;

  if (isList) {
    return (
      <Link
        prefetch={false}
        href={`/product/${product.slug || product._id || product.id}`}
        className="group flex bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 overflow-hidden relative w-full"
      >
        <div className="w-48 h-48 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
          {isBestSelling && product.salesCount && product.salesCount > 30 && (
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm flex items-center gap-1">
              🔥 {product.salesCount}+ Sold
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col justify-center flex-1">
          <h4 className="text-xl font-medium text-gray-900 group-hover:underline mb-2">
            {product.title || product.name}
          </h4>
          {product.shortDescription && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {product.shortDescription}
            </p>
          )}
          <div className="mt-auto flex items-center gap-4">
            <span className="font-semibold text-gray-900 text-lg">
              {theme?.currencySymbol || "৳"}{" "}
              {product.discountedPrice ||
                product.originalPrice ||
                product.price}
            </span>
            {product.originalPrice > (product.discountedPrice || 0) && (
              <span className="text-sm text-gray-400 line-through">
                {theme?.currencySymbol || "৳"} {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      prefetch={false}
      href={`/product/${product.slug || product._id || product.id}`}
      className="group block"
    >
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
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 flex justify-between gap-1 z-10 pointer-events-none">
          <div className="flex-1 flex justify-start overflow-hidden min-w-0">
            {product.originalPrice > (product.discountedPrice || 0) && (
              <div className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-gray-900 text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm truncate pointer-events-auto max-w-full">
                Sale
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-end overflow-hidden min-w-0">
            {isBestSelling && product.salesCount && product.salesCount > 30 && (
              <div className="px-1.5 py-0.5 sm:px-3 sm:py-1 bg-amber-500 text-white text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-sm shadow-sm truncate pointer-events-auto max-w-full">
                🔥 {product.salesCount}+ Sold
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-2 bg-white/40 backdrop-blur-md border-t border-white/20 flex flex-col justify-end transition-all duration-300 translate-y-0 opacity-100 lg:translate-y-full lg:opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <ProductCardActions product={product} theme={theme} />
        </div>
      </div>
      <h4 className="text-lg font-medium text-gray-900 group-hover:underline truncate">
        {product.title || product.name}
      </h4>
      <div className="mt-2 flex items-center gap-3">
        <span className="font-semibold text-gray-900">
          {theme?.currencySymbol || "৳"}{" "}
          {product.discountedPrice || product.originalPrice || product.price}
        </span>
        {product.originalPrice > (product.discountedPrice || 0) && (
          <span className="text-sm text-gray-400 line-through">
            {theme?.currencySymbol || "৳"} {product.originalPrice}
          </span>
        )}
      </div>
    </Link>
  );
}
