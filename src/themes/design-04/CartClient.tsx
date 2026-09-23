'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { getTranslation } from '@/utils/translations';

export default function CartClient04({ theme, storeInfo }: { theme?: any; storeInfo?: any }) {
  const { cartItems, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language, key);

  return (
    <main className="max-w-[1400px] mx-auto px-6 py-16 flex-1 w-full">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 font-medium">Looks like you haven't added anything to your cart yet.</p>
          <Link prefetch={false} href="/categories" className="px-10 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-700 transition-colors shadow-sm">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-xl border border-gray-100 shrink-0 flex items-center justify-center p-1 sm:p-2">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
                    <div className="text-base sm:text-lg font-black text-gray-900">{theme?.currencySymbol || '৳'}{' '}{item.price.toLocaleString()}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-full bg-white p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><Minus size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                      <div className="w-6 sm:w-10 text-center font-bold text-gray-900 text-xs sm:text-sm">{item.quantity}</div>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"><Plus size={12} className="sm:w-3.5 sm:h-3.5" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><Trash2 size={16} className="sm:w-4.5 sm:h-4.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-96 shrink-0">
            <div className="bg-gray-900 rounded-3xl p-8 text-white sticky top-28 shadow-xl">
              <h2 className="text-xl font-bold mb-8">{t('orderSummary') || 'Order Summary'}</h2>
              <div className="space-y-4 mb-8 text-sm font-medium text-gray-300">
                <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span><span className="text-white">{theme?.currencySymbol || '৳'}{' '}{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>{t('shipping') || 'Shipping'}</span><span className="text-white">Calculated at checkout</span></div>
                <div className="h-px bg-gray-700 w-full my-4"></div>
                <div className="flex justify-between text-lg font-black text-white"><span>{t('total') || 'Total'}</span><span>{theme?.currencySymbol || '৳'}{' '}{totalPrice.toLocaleString()}</span></div>
              </div>
              <Link prefetch={false} href="/checkout" className="block w-full py-4 bg-white text-gray-900 text-center font-bold rounded-full hover:bg-gray-200 transition-colors shadow-md">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
