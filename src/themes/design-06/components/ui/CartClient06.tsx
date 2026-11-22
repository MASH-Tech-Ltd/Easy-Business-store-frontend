'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { getCartThumbnailUrl } from '@/utils/imageOptimizer';

export default function CartClient06({ theme }: { theme?: any }) {
  const language = theme?.language || 'en';
  const t = (key: any) => getTranslation(language || 'en', key);

  const { cartItems: items, updateQuantity, removeFromCart, totalPrice: subtotal } = useCart();

  const defaultShipping = theme?.defaultShippingCost ?? 120;
  const shippingEstimate = items.length > 0 ? defaultShipping : 0;
  const total = Math.round(subtotal + shippingEstimate);

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          Looks like you haven&apos;t added any modest couture pieces yet. Discover our curated catalog.
        </p>
        <Link
          prefetch={false}
          href="/products"
          className="bg-black text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors shadow-md"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white py-8 sm:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 tracking-tight">
          Shopping Bag ({items.length})
        </h1>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          {/* Items Table */}
          <div className="flex-1">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-100 mb-6">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                    <div className="w-20 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                      {item.image ? (
                        <img
                          src={getCartThumbnailUrl(item.image)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 uppercase">
                          No Pic
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 pr-2">
                      <Link
                        prefetch={false}
                        href={`/product/${item.productId || item.id}`}
                        className="font-heading text-sm font-semibold text-gray-900 hover:text-black line-clamp-2 leading-snug mb-1 cursor-pointer"
                      >
                        {item.title}
                      </Link>
                      {(item.color || item.size) && (
                        <p className="text-[11px] text-gray-500 mb-1">
                          {item.color ? `Color: ${item.color}` : ''}
                          {item.color && item.size ? ' • ' : ''}
                          {item.size ? `Size: ${item.size}` : ''}
                        </p>
                      )}
                      <p className="text-xs font-bold text-gray-900">
                        {theme?.currencySymbol || '৳'}{' '}{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Counter */}
                  <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-center">
                    <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50/50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-xs text-gray-700 shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-xs text-gray-700 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="md:hidden text-gray-400 hover:text-rose-600 p-2 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Line Total & Remove on desktop */}
                  <div className="col-span-1 md:col-span-3 hidden md:flex items-center justify-end gap-4">
                    <span className="font-bold text-sm text-gray-900">
                      {theme?.currencySymbol || '৳'}{' '}{(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 pb-3 border-b border-gray-200">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {theme?.currencySymbol || '৳'}{' '}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shippingEstimate > 0 ? `${theme?.currencySymbol || '৳'} ${shippingEstimate.toLocaleString()}` : 'Free'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-between items-baseline">
                <span className="font-bold text-base text-gray-900">Total</span>
                <span className="font-bold text-xl text-gray-900">
                  {theme?.currencySymbol || '৳'}{' '}{total.toLocaleString()}
                </span>
              </div>

              <Link
                prefetch={false}
                href="/checkout"
                className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md mt-4 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 text-center">
                <Link
                  prefetch={false}
                  href="/products"
                  className="text-xs text-gray-500 hover:text-black underline transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
