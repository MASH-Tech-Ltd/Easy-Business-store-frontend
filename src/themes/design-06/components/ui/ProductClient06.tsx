'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Star, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';
import {
  getProductMainImageUrl,
  getOptimizedImageUrl,
  preloadProductMainImage,
} from '@/utils/imageOptimizer';
import { useProductTracker } from '@/hooks/useProductTracker';
import ProductCard06 from './ProductCard';

const getYouTubeEmbedUrl = (rawUrl: string): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let str = rawUrl.trim();
  if (!str) return '';

  // If already embed URL
  if (str.includes('/embed/')) {
    const match = str.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (match?.[1]) return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
    return str;
  }

  // Bare 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return `https://www.youtube-nocookie.com/embed/${str}?rel=0`;
  }

  if (!/^https?:\/\//i.test(str)) {
    str = 'https://' + str;
  }

  try {
    const parsed = new URL(str);
    let videoId: string | null = null;

    if (parsed.hostname.includes('youtu.be')) {
      videoId = parsed.pathname.split('/')[1] || null;
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      } else if (parsed.pathname.startsWith('/live/')) {
        videoId = parsed.pathname.split('/')[2] || null;
      } else {
        videoId = parsed.searchParams.get('v');
      }
    }

    if (videoId) {
      videoId = videoId.split('?')[0].split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    }
  } catch {
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
    const match = str.match(regExp);
    if (match?.[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`;
    }
  }

  return str;
};

export default function ProductClient06({
  product,
  theme,
  storeInfo,
  relatedProducts = [],
}: {
  product: any;
  theme?: any;
  storeInfo?: any;
  relatedProducts?: any[];
}) {
  const language = theme?.language || 'bn';
  const t = (key: any) => getTranslation(language, key);

  // Variant resolution
  const hasVariants = Boolean(
    product?.hasVariants &&
    Array.isArray(product?.variants) &&
    product.variants.length > 0
  );

  const availableColors = useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(
      new Set(product.variants.map((v: any) => v.color?.trim()).filter(Boolean))
    ) as string[];
  }, [hasVariants, product?.variants]);

  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(
      new Set(product.variants.map((v: any) => v.size?.trim()).filter(Boolean))
    ) as string[];
  }, [hasVariants, product?.variants]);

  const [selectedColor, setSelectedColor] = useState<string>(
    () => availableColors[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    () => availableSizes[0] || ''
  );

  // Dynamic Features list
  const featuresList: string[] = useMemo(() => {
    if (!product?.features) return [];
    if (Array.isArray(product.features)) {
      return product.features.filter(
        (f: any) => typeof f === 'string' && f.trim().length > 0
      );
    }
    if (typeof product.features === 'string') {
      try {
        const parsed = JSON.parse(product.features);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (f: any) => typeof f === 'string' && f.trim().length > 0
          );
        }
      } catch {
        return product.features.trim() ? [product.features.trim()] : [];
      }
    }
    return [];
  }, [product?.features]);

  // Find currently matched variant
  const matchedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return (
      product.variants.find((v: any) => {
        const matchColor =
          !availableColors.length ||
          v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase();
        const matchSize =
          !availableSizes.length ||
          v.size?.trim().toLowerCase() === selectedSize.trim().toLowerCase();
        return matchColor && matchSize;
      }) || null
    );
  }, [hasVariants, product?.variants, selectedColor, selectedSize, availableColors.length, availableSizes.length]);

  // Dynamic stock calculations
  const currentStock = hasVariants
    ? matchedVariant
      ? Number(matchedVariant.stock) || 0
      : 0
    : typeof product?.stock === 'number'
    ? product.stock
    : 999;

  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc');

  const { addToCart } = useCart();
  const router = useRouter();

  // Dynamic images list
  const allImages: string[] = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product?.images) && product.images.length > 0) {
      product.images.forEach((img: any) => {
        const url = typeof img === 'string' ? img : img?.secure_url || img?.url;
        if (url && !list.includes(url)) list.push(url);
      });
    }
    const single =
      product?.image?.secure_url ||
      product?.image?.url ||
      (typeof product?.image === 'string' ? product?.image : '');
    if (single && !list.includes(single)) {
      list.unshift(single);
    }
    return list;
  }, [product?.images, product?.image]);

  const [selectedImage, setSelectedImage] = useState<string>(() => allImages[0] || '');

  // Preload secondary images for instant gallery switching
  useEffect(() => {
    if (allImages.length <= 1) return;
    const timer = setTimeout(() => {
      allImages.slice(1).forEach((imgUrl) => {
        preloadProductMainImage(imgUrl);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [allImages]);

  // Dynamic Prices
  const basePrice =
    matchedVariant?.price ||
    product?.discountedPrice ||
    product?.discountPrice ||
    product?.originalPrice ||
    product?.price ||
    0;
  const originalPrice = matchedVariant?.originalPrice || product?.originalPrice || 0;
  const hasDiscount = originalPrice > basePrice;
  const savePercent = hasDiscount
    ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
    : 0;

  const isOutOfStock =
    product?.isOutOfStock === true ||
    product?.inStock === false ||
    product?.status === 'out_of_stock' ||
    currentStock <= 0;
  const inStock = !isOutOfStock;

  // Tracking
  const { trackRef } = useProductTracker({
    productId: product?._id || product?.id,
    tenantId: product?.tenantId,
    sourceSection: 'details',
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItemId = matchedVariant?._id
      ? `${product._id || product.id}-${matchedVariant._id}`
      : `${product._id || product.id}${selectedColor ? `-${selectedColor}` : ''}${selectedSize ? `-${selectedSize}` : ''}`;

    addToCart(
      {
        id: cartItemId,
        productId: product._id || product.id,
        variantId: matchedVariant?._id,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
        title: product.title || product.name,
        price: basePrice,
        image: selectedImage || allImages[0] || '',
        tenantId: product.tenantId || 'main',
        maxStock: currentStock,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push('/checkout');
  };

  // Dynamic Badges (Real data only & Merchant Dashboard Primary Color)
  const displayBadge = useMemo(() => {
    if (isOutOfStock) return language === 'bn' ? 'স্টকে নেই' : 'Out of Stock';
    if (hasDiscount) return language === 'bn' ? `${savePercent}% ছাড়` : `${savePercent}% OFF`;
    if (product?.badgeText) return product.badgeText;
    if (product?.badge) return product.badge;
    if (product?.isBestSelling) return language === 'bn' ? 'বেস্ট সেলার' : 'Best Seller';
    return null;
  }, [isOutOfStock, hasDiscount, savePercent, product?.badgeText, product?.badge, product?.isBestSelling, language]);

  // Dynamic Specifications
  const hasSpecifications = Array.isArray(product?.specifications) && product.specifications.length > 0;

  // Dynamic Product Videos
  const rawVideoList: string[] = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product?.videos)) {
      list.push(...product.videos.filter((v: any) => typeof v === 'string' && v.trim()));
    } else if (typeof product?.videos === 'string' && product.videos.trim()) {
      list.push(product.videos.trim());
    }
    if (product?.video) {
      if (Array.isArray(product.video)) {
        list.push(...product.video.filter((v: any) => typeof v === 'string' && v.trim()));
      } else if (typeof product.video === 'string' && product.video.trim()) {
        list.push(product.video.trim());
      }
    }
    if (typeof product?.videoUrl === 'string' && product.videoUrl.trim()) {
      list.push(product.videoUrl.trim());
    }
    if (typeof product?.youtubeUrl === 'string' && product.youtubeUrl.trim()) {
      list.push(product.youtubeUrl.trim());
    }
    return Array.from(new Set(list));
  }, [product?.videos, product?.video, product?.videoUrl, product?.youtubeUrl]);

  // Category name and slug
  const categoryName =
    product?.categoryId?.name ||
    product?.category?.name ||
    (typeof product?.category === 'string' ? product.category : null) ||
    '';
  const categorySlug =
    product?.categoryId?.slug ||
    product?.category?.slug ||
    product?.categoryId?._id ||
    product?.category?._id ||
    product?.categoryId ||
    product?.category ||
    '';

  return (
    <div ref={trackRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-8 overflow-hidden text-ellipsis whitespace-nowrap">
        <Link href="/" className="hover:text-black transition-colors shrink-0">
          {t('home') || 'হোম'}
        </Link>
        <span className="shrink-0">/</span>
        <Link href="/products" className="hover:text-black transition-colors shrink-0">
          {t('allProducts') || (language === 'bn' ? 'সব পণ্য' : 'Shop')}
        </Link>
        {categoryName && (
          <>
            <span className="shrink-0">/</span>
            <Link
              href={`/category/${encodeURIComponent(categorySlug)}`}
              className="hover:text-black transition-colors shrink-0"
            >
              {categoryName}
            </Link>
          </>
        )}
        <span className="shrink-0">/</span>
        <span className="text-gray-900 truncate">{product?.title || product?.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left: Gallery (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 items-start w-full lg:sticky lg:top-24">
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[500px] scrollbar-none shrink-0 py-1">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View image ${idx + 1}`}
                  className={`w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-gray-50 cursor-pointer ${
                    selectedImage === img
                      ? 'border-black ring-1 ring-black scale-95'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(img, 120)}
                    alt={`${product?.title || 'Product'} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover aspect-square"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Photo (Strict 1:1 Square) */}
          <div className="flex-1 w-full aspect-square relative rounded-3xl overflow-hidden bg-[#F7F7F7] border border-gray-100 group shadow-sm">
            {/* Dynamic Badge Container (styled by Merchant Dashboard Color) */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
              {displayBadge && (
                <span
                  style={{
                    backgroundColor: theme?.primaryColor || '#111827',
                    color: '#ffffff',
                  }}
                  className="text-[11px] font-bold px-3 py-1 rounded-md tracking-wide shadow-md"
                >
                  {displayBadge}
                </span>
              )}
            </div>

            {selectedImage ? (
              <img
                src={getProductMainImageUrl(selectedImage)}
                alt={product?.title || 'Product'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out aspect-square"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase">
                {t('noImage') || (language === 'bn' ? 'কোন ছবি নেই' : 'No Image')}
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details (6 cols on lg) */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          {product?.brand && (
            <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">
              {product.brand}
            </span>
          )}

          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            {product?.title || product?.name}
          </h1>

          {/* SKU, Stock & Sales metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-4 pb-3 border-b border-gray-100">
            {(product?.sku || product?._id) && (
              <span>
                {t('productId') || (language === 'bn' ? 'প্রোডাক্ট আইডি' : 'SKU')}:{' '}
                <span className="font-semibold text-gray-800">{product.sku || product._id?.slice(-6)}</span>
              </span>
            )}
            {Boolean(product?.salesCount && product.salesCount > 0) && (
              <>
                <span className="text-gray-300">|</span>
                <span className="font-medium text-gray-700 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                  {product.salesCount} {t('sold') || (language === 'bn' ? 'বিক্রি হয়েছে' : 'sold')}
                </span>
              </>
            )}
            <span className="text-gray-300">|</span>
            {inStock ? (
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {t('inStock') || (language === 'bn' ? 'স্টকে আছে' : 'In Stock')}{' '}
                {currentStock > 0 && currentStock < 999 ? `(${currentStock})` : ''}
              </span>
            ) : (
              <span className="font-medium text-rose-600 flex items-center gap-1">
                {t('outOfStock') || (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock')}
              </span>
            )}
          </div>

          {/* Price Block */}
          <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-gray-100 flex-wrap">
            <span className="font-bold text-2xl sm:text-3xl text-gray-900">
              {theme?.currencySymbol || '৳'}{' '}{basePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-base text-gray-400 line-through">
                {theme?.currencySymbol || '৳'}{' '}{originalPrice.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {language === 'bn'
                  ? `সাশ্রয় ${theme?.currencySymbol || '৳'} ${(originalPrice - basePrice).toLocaleString()} (${savePercent}%)`
                  : `Save ${theme?.currencySymbol || '৳'} ${(originalPrice - basePrice).toLocaleString()} (${savePercent}%)`}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product?.shortDescription && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
              {product.shortDescription}
            </p>
          )}

          {/* Dynamic Highlights / Key Features if provided in DB */}
          {featuresList.length > 0 && (
            <div className="mb-6 p-4 sm:p-5 bg-[#FAFAFA] rounded-2xl border border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-black rounded-full" />
                {t('keyHighlights') || (language === 'bn' ? 'মূল বৈশিষ্ট্য' : 'Key Highlights')}
              </h3>
              <ul className="space-y-2">
                {featuresList.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                {language === 'bn' ? 'রং:' : 'Color:'} <span className="font-normal text-gray-900">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-xs'
                          : 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white'
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
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
                {language === 'bn' ? 'সাইজ:' : 'Size:'} <span className="font-normal text-gray-900">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize.toLowerCase() === size.toLowerCase();
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`min-w-[48px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-xs'
                          : 'border-gray-200 text-gray-800 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Variant Stock Status */}
          {hasVariants && (
            <div className="mb-6 text-xs font-medium">
              {currentStock > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />{' '}
                  {language === 'bn'
                    ? `স্টকে আছে (${currentStock} টি উপলব্ধ)`
                    : `In Stock (${currentStock} available)`}
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">
                  ✕ {language === 'bn' ? 'এই ভ্যারিয়েন্ট স্টকে নেই' : 'Out of Stock for this variant'}
                </span>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4 pt-2 mb-8">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {t('quantity') || (language === 'bn' ? 'পরিমাণ' : 'Quantity')}
              </span>
              <div
                className={`flex items-center border border-gray-200 rounded-full bg-gray-50/50 p-1 ${
                  !inStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!inStock || quantity <= 1}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (q < currentStock ? q + 1 : q))}
                  disabled={!inStock || quantity >= currentStock}
                  className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Dynamic Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                style={
                  inStock && theme?.buttonColors?.addToCart
                    ? {
                        backgroundColor: theme.buttonColors.addToCart,
                        borderColor: theme.buttonColors.addToCart,
                        color: '#fff',
                      }
                    : {}
                }
                className={`w-full py-4 px-6 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  !inStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-black text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{!inStock ? t('outOfStock') || (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock') : t('addToCart') || (language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart')}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!inStock}
                style={
                  inStock && theme?.buttonColors?.buyNow
                    ? { backgroundColor: theme.buttonColors.buyNow }
                    : inStock && theme?.primaryColor
                    ? { backgroundColor: theme.primaryColor }
                    : {}
                }
                className={`w-full py-4 px-6 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  !inStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-900 hover:shadow-xl'
                }`}
              >
                <span>{!inStock ? t('outOfStock') || (language === 'bn' ? 'স্টকে নেই' : 'Out of Stock') : t('buyNow') || (language === 'bn' ? 'এখনই কিনুন' : 'Buy Now')}</span>
              </button>
            </div>
          </div>

          {/* Product Details Tabs (বিবরণ & বৈশিষ্ট্যসমূহ) */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex gap-6 border-b border-gray-100 pb-3 mb-4 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('desc')}
                className={`pb-3 -mb-3 transition-colors cursor-pointer ${
                  activeTab === 'desc' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {language === 'bn' ? 'বিবরণ' : (t('productDetails') || 'Description')}
              </button>

              {(hasSpecifications || product?.brand || product?.sku || product?.warranty) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 -mb-3 transition-colors cursor-pointer ${
                    activeTab === 'specs' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {t('specifications') || (language === 'bn' ? 'বৈশিষ্ট্যসমূহ' : 'Specifications')}
                </button>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {/* Tab 1: Description */}
              {activeTab === 'desc' && (
                <div
                  className="prose prose-sm max-w-none text-gray-700 rich-product-description"
                  dangerouslySetInnerHTML={{
                    __html:
                      product?.description ||
                      product?.shortDescription ||
                      (language === 'bn' ? 'এই পণ্যের বিস্তারিত বিবরণ উপরে দেওয়া হয়েছে।' : 'Detailed information for this item is provided above.'),
                  }}
                />
              )}

              {/* Tab 2: Specifications (100% dynamic from database) */}
              {activeTab === 'specs' && (
                <div className="space-y-4">
                  {hasSpecifications ? (
                    product.specifications.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="space-y-2">
                        {group.group && (
                          <h4 className="font-bold text-xs uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-1">
                            {group.group}
                          </h4>
                        )}
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.entries?.map((entry: any, eIdx: number) => (
                            <div key={eIdx} className="flex justify-between py-1 border-b border-dashed border-gray-100 text-xs">
                              <dt className="text-gray-500">{entry.name}</dt>
                              <dd className="font-semibold text-gray-900">{entry.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))
                  ) : (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {product?.brand && (
                        <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <dt className="text-gray-500">{language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}</dt>
                          <dd className="font-semibold text-gray-900">{product.brand}</dd>
                        </div>
                      )}
                      {categoryName && (
                        <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <dt className="text-gray-500">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</dt>
                          <dd className="font-semibold text-gray-900">{categoryName}</dd>
                        </div>
                      )}
                      {product?.sku && (
                        <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <dt className="text-gray-500">{language === 'bn' ? 'এসকিউ (SKU)' : 'SKU'}</dt>
                          <dd className="font-semibold text-gray-900">{product.sku}</dd>
                        </div>
                      )}
                      {product?.warranty && (
                        <div className="flex justify-between py-1 border-b border-dashed border-gray-100">
                          <dt className="text-gray-500">{language === 'bn' ? 'ওয়ারেন্টি' : 'Warranty'}</dt>
                          <dd className="font-semibold text-gray-900">{product.warranty}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Product Videos (if any) */}
      {rawVideoList.length > 0 && (
        <div className="mt-16 pt-12 border-t border-gray-100">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('productVideos') || (language === 'bn' ? 'পণ্যের ভিডিও' : 'Product Videos')}
          </h2>
          <div
            className={
              rawVideoList.length === 1
                ? 'max-w-3xl mx-auto'
                : 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto'
            }
          >
            {rawVideoList.map((video: string, index: number) => {
              const embedUrl = getYouTubeEmbedUrl(video);
              if (!embedUrl) return null;
              return (
                <div
                  key={index}
                  className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-gray-100 shadow-md relative"
                >
                  <iframe
                    src={embedUrl}
                    title={`Product Video ${index + 1}`}
                    className="w-full h-full"
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dynamic Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {language === 'bn' ? 'আপনার আরও পছন্দ হতে পারে' : 'You May Also Like'}
            </h2>
            <Link
              href="/products"
              prefetch={false}
              className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-black border-b border-black pb-0.5 cursor-pointer"
            >
              {language === 'bn' ? 'সব দেখুন' : 'View All'}
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {relatedProducts.map((p: any) => (
              <ProductCard06 key={p._id} product={p} theme={theme} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
