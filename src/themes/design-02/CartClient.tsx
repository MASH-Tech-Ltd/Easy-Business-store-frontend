'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useTranslation } from '@/context/LanguageContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

export default function Design02CartClient() {
  const { cartItems, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { t } = useTranslation();

  return (
    <>
      <main className="max-w-7xl mx-auto px-8 py-20 flex-1 w-full">
        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-xl">
            <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-4">{t('yourCartIsEmpty') || 'Your Cart is Empty'}</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">{t('browseProducts') || 'Looks like you haven\'t added anything to your cart yet.'}</p>
            <Link 
              href="/categories" 
              className="px-8 py-4 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-md"
            >
              {t('startShopping') || 'Continue Shopping'}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-8">
                Your Bag ({totalItems})
              </h2>
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-8 flex flex-col sm:flex-row items-center gap-8 group">
                    <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                      ) : (
                        <span className="text-gray-400 text-sm">No Image</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col text-center sm:text-left">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{item.title}</h3>
                      <div className="text-xl font-light text-gray-900">৳{item.price.toLocaleString()}</div>
                    </div>
                    
                    <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center border border-gray-200 rounded">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <div className="w-12 text-center font-medium text-gray-900 text-sm">
                          {item.quantity}
                        </div>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-gray-900 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-[380px] shrink-0">
              <div className="bg-gray-50 rounded-2xl p-8 sticky top-28">
                <h2 className="text-xl font-medium text-gray-900 mb-8">{t('orderSummary') || 'Order Summary'}</h2>
                
                <div className="space-y-4 mb-8 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('subtotal') || 'Subtotal'}</span>
                    <span className="font-medium text-gray-900">৳{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('shipping') || 'Shipping'}</span>
                    <span className="font-medium text-gray-900">{t('calculatedAtCheckout') || 'Calculated at checkout'}</span>
                  </div>
                  <div className="h-px bg-gray-200 w-full my-4"></div>
                  <div className="flex justify-between text-lg font-medium text-gray-900">
                    <span>{t('total') || 'Total'}</span>
                    <span>৳{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout" 
                  className="w-full py-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors shadow-md flex justify-center items-center gap-2"
                >
                  {t('proceedToCheckout') || 'Proceed to Checkout'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
