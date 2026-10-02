"use client";

import React from "react";
import { ShoppingCart, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import { getTranslation } from "@/utils/translations";

interface ProductProps {
  product: {
    id?: number | string;
    _id?: string;
    slug?: string;
    title: string;
    image?: string | { secure_url: string };
    images?: Array<{ secure_url: string }>;
    originalPrice: number;
    discountedPrice: number;
    saveAmount?: number;
    shortDescription?: string;
    tenantId: string;
    salesCount?: number;
    stock?: number;
    quantity?: number;
    inStock?: boolean;
    isOutOfStock?: boolean;
    status?: string;
  };
  isList?: boolean;
  isBestSelling?: boolean;
  theme?: any;
}

export default function ProductCard({
  product,
  isList = false,
  isBestSelling = false,
  theme,
}: ProductProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  const productId = product._id || product.id;
  const productSlug = product.slug || productId;

  // Handle both single image and images array structures
  let imageUrl = "";
  if (product.images && product.images.length > 0) {
    imageUrl = product.images[0].secure_url;
  } else if (product.image) {
    imageUrl =
      typeof product.image === "string"
        ? product.image
        : product.image.secure_url;
  }

  const savePercent =
    product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.discountedPrice) /
            product.originalPrice) *
            100,
        )
      : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    addToCart({
      id: String(productId),
      title: product.title,
      price: product.discountedPrice,
      image: imageUrl,
      tenantId: product.tenantId || "main",
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    addToCart({
      id: String(productId),
      title: product.title,
      price: product.discountedPrice,
      image: imageUrl,
      tenantId: product.tenantId || "main",
    });
    router.push("/cart"); // Change to /cart instead of /checkout, user usually wants to see cart first or straight to checkout. We'll send them to cart to proceed.
  };

  const isOutOfStock = 
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === 'out_of_stock' ||
    (typeof product.stock === 'number' && product.stock <= 0) ||
    (typeof product.quantity === 'number' && product.quantity <= 0);

  return (
    <Link
      prefetch={false}
      href={`/product/${productSlug}`}
      className={`group flex bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-indigo-100 transition-all duration-300 overflow-hidden relative ${isList ? "flex-row" : "flex-col"}`}
    >
      {/* Image Container */}
      <div
        className={`relative bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 ${isList ? "w-56 h-56" : "aspect-square w-full"}`}
      >
        {(savePercent > 0 ||
          (product.saveAmount && product.saveAmount > 0)) && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {(
              product.saveAmount ||
              product.originalPrice - product.discountedPrice
            ).toLocaleString()}{" "}
            {t("bdt")} Off
          </div>
        )}
        {isBestSelling && product.salesCount && product.salesCount > 20 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[11px] font-extrabold px-2 py-1 rounded-md z-10 shadow-md flex items-center gap-1">
            🔥 {product.salesCount}+ Sold
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
            <span className="bg-gray-900/90 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 backdrop-blur-md">
              Out of Stock
            </span>
          </div>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? "opacity-70 grayscale-[30%]" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
            No image
          </div>
        )}
      </div>

      {/* Details Section */}
      {isList ? (
        <div className="flex flex-1 flex-row">
          {/* Main Info */}
          <div className="p-6 flex flex-col flex-1 border-r border-gray-100 justify-start">
            <h4 className="text-xl font-bold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
              {product.title}
            </h4>
            {product.shortDescription && (
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          {/* Pricing & Actions */}
          <div className="w-64 p-6 flex flex-col justify-center shrink-0 bg-gray-50/50">
            <div className="flex flex-col gap-1 mb-6 text-center">
              <span className="font-extrabold text-indigo-700 text-3xl">
                {product.discountedPrice.toLocaleString()} {t("bdt")}
              </span>
              {product.originalPrice > product.discountedPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {product.originalPrice.toLocaleString()} {t("bdt")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center space-x-2 py-3 border-2 rounded-xl font-bold transition-opacity ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400' : 'hover:opacity-80'}`}
                style={!isOutOfStock ? {
                  borderColor: theme?.buttonColors?.addToCart || theme?.primaryColor || '#4f46e5',
                  color: theme?.buttonColors?.addToCart || theme?.primaryColor || '#4f46e5',
                } : {}}
              >
                <ShoppingCart size={18} />
                <span>{t("addToCart")}</span>
              </button>
              <button
                onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleBuyNow}
                disabled={isOutOfStock}
                className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold transition-opacity shadow-md ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'text-white hover:opacity-90'}`}
                style={!isOutOfStock ? {
                  backgroundColor: theme?.buttonColors?.buyNow || theme?.primaryColor || '#4f46e5'
                } : {}}
              >
                <Zap size={18} />
                <span>{t("buyNow")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 flex flex-col flex-1">
          <h4 className="text-[15px] font-semibold text-gray-900 leading-snug mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[44px]">
            {product.title}
          </h4>

          <div className="flex items-center gap-2 mb-5">
            <span className="font-black text-indigo-700 text-lg">
              {product.discountedPrice.toLocaleString()} {t("bdt")}
            </span>
            {product.originalPrice > product.discountedPrice && (
              <span className="text-[13px] text-gray-400 line-through font-medium">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto flex sm:grid sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center shrink-0 w-9 h-9 sm:w-full sm:h-auto sm:py-2.5 border-2 rounded-lg transition-opacity font-semibold ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400' : 'hover:opacity-80'}`}
              title="Add to Cart"
              style={!isOutOfStock ? {
                borderColor: theme?.buttonColors?.addToCart || theme?.primaryColor || '#4f46e5',
                color: theme?.buttonColors?.addToCart || theme?.primaryColor || '#4f46e5',
                backgroundColor: 'transparent'
              } : {}}
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); } : handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 sm:w-full flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-2.5 rounded-lg transition-opacity shadow-sm font-semibold text-[11px] sm:text-sm ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-200' : 'text-white hover:opacity-90'}`}
              title="Buy Now"
              style={!isOutOfStock ? {
                backgroundColor: theme?.buttonColors?.buyNow || theme?.primaryColor || '#4f46e5'
              } : {}}
            >
              <Zap size={14} className="shrink-0" />
              <span className="truncate">{t("buyNow")}</span>
            </button>
          </div>
        </div>
      )}
    </Link>
  );
}
