"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Star, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/utils/translations";

export default function ProductClient05({
  product,
  theme,
}: {
  product: any;
  theme?: any;
}) {
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || "en", key);

  const hasVariants = Boolean(
    product?.hasVariants &&
    Array.isArray(product?.variants) &&
    product.variants.length > 0,
  );

  const availableColors = React.useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(
      new Set(
        product.variants.map((v: any) => v.color?.trim()).filter(Boolean),
      ),
    ) as string[];
  }, [hasVariants, product.variants]);

  const availableSizes = React.useMemo(() => {
    if (!hasVariants) return [];
    return Array.from(
      new Set(product.variants.map((v: any) => v.size?.trim()).filter(Boolean)),
    ) as string[];
  }, [hasVariants, product.variants]);

  const featuresList: string[] = React.useMemo(() => {
    if (!product?.features) return [];
    if (Array.isArray(product.features)) {
      return product.features.filter(
        (f: any) => typeof f === "string" && f.trim().length > 0,
      );
    }
    if (typeof product.features === "string") {
      try {
        const parsed = JSON.parse(product.features);
        if (Array.isArray(parsed))
          return parsed.filter(
            (f: any) => typeof f === "string" && f.trim().length > 0,
          );
      } catch {
        return product.features.trim() ? [product.features.trim()] : [];
      }
    }
    return [];
  }, [product?.features]);

  const [selectedColor, setSelectedColor] = useState<string>(
    () => availableColors[0] || "",
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    () => availableSizes[0] || "",
  );

  const { addToCart } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(
    product.images?.[0]?.secure_url || product.image || "",
  );
  const [quantity, setQuantity] = useState(1);

  // Find currently matched variant
  const matchedVariant = React.useMemo(() => {
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
  }, [
    hasVariants,
    product.variants,
    selectedColor,
    selectedSize,
    availableColors.length,
    availableSizes.length,
  ]);

  const currentStock = hasVariants
    ? matchedVariant
      ? Number(matchedVariant.stock) || 0
      : 0
    : typeof product.stock === "number"
      ? product.stock
      : 999;

  const price =
    product.discountedPrice || product.originalPrice || product.price || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > price;
  const isOutOfStock =
    product.isOutOfStock === true ||
    product.inStock === false ||
    product.status === "out_of_stock" ||
    currentStock <= 0;
  const inStock = !isOutOfStock;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItemId = matchedVariant?._id
      ? `${product._id || product.id}-${matchedVariant._id}`
      : `${product._id || product.id}${selectedColor ? `-${selectedColor}` : ""}${selectedSize ? `-${selectedSize}` : ""}`;

    addToCart(
      {
        id: cartItemId,
        productId: product._id || product.id,
        variantId: matchedVariant?._id,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
        title: product.title || product.name,
        price,
        image: activeImage,
        tenantId: product.tenantId || "main",
        maxStock: currentStock,
      },
      quantity,
    );
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-12 overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center text-[11px] sm:text-[13px] font-semibold text-gray-400 uppercase tracking-widest gap-2 mb-6 lg:mb-10 w-full overflow-hidden">
        <Link
          prefetch={true}
          href="/"
          className="hover:text-black transition-colors shrink-0"
        >
          {t("home") || "Home"}
        </Link>
        <span className="text-gray-300 shrink-0">/</span>
        <Link
          prefetch={true}
          href="/products"
          className="hover:text-black transition-colors shrink-0"
        >
          {t("allProducts") || "Products"}
        </Link>
        <span className="text-gray-300 shrink-0">/</span>
        <span className="text-black truncate min-w-0">
          {product.title || product.name}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Images */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="aspect-[4/4] bg-[#F8F9FA] rounded-[2rem] p-6 sm:p-10 flex items-center justify-center overflow-hidden border border-gray-100 group cursor-zoom-in">
            {activeImage ? (
              <div className="w-full h-full rounded-2xl overflow-hidden">
                <img
                  src={activeImage}
                  alt={product.title}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-110 rounded-2xl"
                />
              </div>
            ) : (
              <div className="text-gray-300 font-bold uppercase tracking-widest">
                {t("noImage") || "No Image"}
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.secure_url)}
                  className={`w-24 h-24 shrink-0 rounded-2xl bg-[#F8F9FA] border p-2 flex items-center justify-center transition-all ${
                    activeImage === img.secure_url
                      ? "border-black shadow-sm"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <img
                    src={img.secure_url}
                    alt=""
                    className="w-full h-full object-cover mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              {product.brand || "Minimal"}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              {product.title || product.name}
            </h1>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-gray-900">
                  {theme?.currencySymbol || "৳"} {price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    {theme?.currencySymbol || "৳"}{" "}
                    {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {inStock ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest rounded-full">
                  <Check className="w-3.5 h-3.5" />
                  {t("inStock") || "In Stock"}
                </div>
              ) : (
                <div className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest rounded-full">
                  {t("outOfStock") || "Out of Stock"}
                </div>
              )}
            </div>

            <p className="text-gray-500 text-lg leading-relaxed whitespace-pre-line break-words">
              {product.shortDescription ||
                product.description ||
                "Premium quality product designed for the modern lifestyle."}
            </p>
          </div>

          {/* Quick Overview (Features) */}
          {featuresList.length > 0 && (
            <div className="mb-8 p-5 bg-[#F8F9FA] rounded-2xl border border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-black rounded-full"></span>
                {t("keyHighlights") || "Quick Overview"}
              </h3>
              <ul className="space-y-2.5">
                {featuresList.map((feature: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                  >
                    <Check
                      className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
                      strokeWidth={2.5}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Color Selection */}
          {availableColors.length > 0 && (
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Color:{" "}
                <span className="text-gray-900 font-bold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color: string) => {
                  const isSelected =
                    selectedColor.toLowerCase() === color.toLowerCase();
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                        isSelected
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-black"
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
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Size:{" "}
                <span className="text-gray-900 font-bold">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((size: string) => {
                  const isSelected =
                    selectedSize.toLowerCase() === size.toLowerCase();
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                        isSelected
                          ? "border-black bg-black text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock Availability for Variant */}
          {hasVariants && (
            <div className="mb-6 text-xs font-medium">
              {currentStock > 0 ? (
                <span className="text-green-600 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> In Stock ({currentStock}{" "}
                  available)
                </span>
              ) : (
                <span className="text-red-500 font-semibold">
                  ✕ Out of Stock for this variant
                </span>
              )}
            </div>
          )}

          <div className="mb-10">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              {t("quantity") || "Quantity"}
            </label>
            <div
              className={`flex items-center border border-gray-200 rounded-full w-fit p-1 bg-white shadow-sm ${!inStock ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!inStock || quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-colors disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span className="w-12 text-center font-semibold text-lg text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => (q < currentStock ? q + 1 : q))
                }
                disabled={!inStock || quantity >= currentStock}
                className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-colors disabled:cursor-not-allowed"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              style={
                inStock && theme?.buttonColors?.addToCart
                  ? {
                      backgroundColor: theme.buttonColors.addToCart,
                      borderColor: theme.buttonColors.addToCart,
                      color: "#fff",
                    }
                  : {}
              }
              className={`flex-1 font-semibold py-4 rounded-full flex items-center justify-center gap-2 transition-all ${!inStock ? "bg-gray-200 border border-gray-300 text-gray-500 opacity-60 cursor-not-allowed" : "bg-white border border-gray-200 text-gray-900 hover:border-black hover:bg-gray-50"}`}
            >
              <ShoppingCart className="w-5 h-5" />
              {!inStock ? "Out of Stock" : t("addToCart") || "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              style={
                inStock && theme?.buttonColors?.buyNow
                  ? { backgroundColor: theme.buttonColors.buyNow }
                  : inStock && theme?.primaryColor
                    ? { backgroundColor: theme.primaryColor }
                    : {}
              }
              className={`flex-1 font-semibold py-4 rounded-full flex items-center justify-center transition-colors shadow-lg ${!inStock ? "bg-gray-700 text-gray-300 opacity-60 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`}
            >
              {!inStock ? "Out of Stock" : t("buyNow") || "Buy Now"}
            </button>
          </div>

          {/* Description Section */}
          <div className="border border-gray-200/70 rounded-3xl p-6 sm:p-8 bg-[#F8F9FA] shadow-xs">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-200/60">
              <span className="w-1.5 h-5 rounded-full bg-black"></span>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                {t("productDetails") || "Product Information"}
              </h3>
            </div>
            <div
              className="rich-product-description"
              dangerouslySetInnerHTML={{
                __html:
                  product.description || "No additional details available.",
              }}
            />
          </div>
        </div>
      </div>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 tracking-tight text-center">
            {t("specifications") || "Specifications"}
          </h2>
          <div className="max-w-4xl mx-auto space-y-12">
            {product.specifications.map((group: any, gIdx: number) => (
              <div key={gIdx}>
                <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">
                  {group.group}
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {group.entries.map((entry: any, eIdx: number) => (
                    <div
                      key={eIdx}
                      className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3"
                    >
                      <dt className="text-sm font-medium text-gray-500 w-1/2 pr-4">
                        {entry.name}
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900 w-1/2 text-right">
                        {entry.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Videos Section */}
      {product.videos && product.videos.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 tracking-tight text-center">
            {t("productVideos") || "Product Videos"}
          </h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.videos.map((video: string, index: number) => {
              let embedUrl = video;
              try {
                const url = new URL(video);
                if (
                  url.hostname.includes("youtube.com") ||
                  url.hostname.includes("youtu.be")
                ) {
                  const videoId = url.hostname.includes("youtu.be")
                    ? url.pathname.slice(1)
                    : url.searchParams.get("v");
                  if (videoId)
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
              } catch (e) {}
              return (
                <div
                  key={index}
                  className="aspect-video bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 p-2"
                >
                  <iframe
                    src={embedUrl}
                    title={`Product Video ${index + 1}`}
                    className="w-full h-full rounded-[1.5rem]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
