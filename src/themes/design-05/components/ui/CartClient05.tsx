'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { getTranslation } from '@/utils/translations';

export default function CartClient05({ theme }: { theme?: any }) {
  const language = theme?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);

  const { cartItems: items, updateQuantity, removeFromCart, totalPrice: subtotal } = useCart();

  const defaultShipping = theme?.defaultShippingCost ?? 120;
  const shippingEstimate = items.length > 0 ? defaultShipping : 0;
  const taxEstimate = 0;
  const total = Math.round(subtotal + shippingEstimate + taxEstimate);

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 bg-[#F8F9FA] rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">Looks like you haven't added anything to your cart yet. Discover our collection of premium products.</p>
        <Link prefetch={false} href="/" className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white pt-12 pb-24">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-12 tracking-tight">Your Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Cart Items List */}
          <div className="flex-1">
            <div className="hidden md:grid grid-cols-12 gap-6 text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-6 border-b border-gray-100 mb-8">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">{t('total') || 'Total'}</div>
            </div>

            <div className="space-y-8">
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center group relative">
                  
                  {/* Product Info */}
                  <div className="col-span-1 md:col-span-6 flex gap-6 w-full">
                    <div className="w-24 h-24 bg-[#F8F9FA] rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 p-2">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <span className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">Image</span>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0 pr-4">
                      <Link prefetch={false} href={`/product/${item.id}`} className="text-sm font-semibold text-gray-900 mb-1 hover:text-gray-600 transition-colors line-clamp-2 leading-tight">
                        {item.title}
                      </Link>
                      <span className="text-sm font-medium text-gray-400 mb-3">{theme?.currencySymbol || '৳'} {Math.round(item.price).toLocaleString()}</span>
                      
                      <button onClick={() => removeFromCart(item.id)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors w-fit">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Mobile divider */}
                  <div className="md:hidden w-full h-px bg-gray-50 my-2"></div>

                  {/* Quantity & Price */}
                  <div className="col-span-1 md:col-span-6 flex items-center justify-between md:grid md:grid-cols-6 w-full">
                    <div className="col-span-3 flex justify-start md:justify-center">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm h-10 w-[110px]">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="flex-1 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex-1 flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="col-span-3 text-right">
                      <span className="text-base font-bold text-gray-900">{theme?.currencySymbol || '৳'} {Math.round(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="bg-[#F8F9FA] rounded-[2rem] p-8 border border-gray-100 sticky top-12">
              <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6 pb-6 border-b border-gray-200">{t('orderSummary') || 'Order Summary'}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{t('subtotal') || 'Subtotal'}</span>
                  <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{t('shipping') || 'Shipping'}</span>
                  <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {shippingEstimate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Estimated Taxes</span>
                  <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {taxEstimate.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-900">{t('total') || 'Total'}</span>
                  <span className="text-2xl font-black text-gray-900 tracking-tight">{theme?.currencySymbol || '৳'} {total.toLocaleString()}</span>
                </div>
              </div>

              <Link prefetch={false} href="/checkout" 
                style={theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
                className="w-full bg-black text-white px-6 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
