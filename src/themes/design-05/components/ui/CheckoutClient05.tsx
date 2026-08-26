'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Check, ShieldCheck, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutClient05({ theme }: { theme?: any }) {
  const { cartItems: items, totalPrice: subtotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shippingEstimate = items.length > 0 ? 60 : 0;
  const taxEstimate = subtotal * 0.15;
  const total = subtotal + shippingEstimate + taxEstimate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100">
          <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Order Confirmed</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
          Thank you for your purchase. We've received your order and will email you the confirmation details shortly.
        </p>
        <Link href="/" 
          style={theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
          className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
          Return to Store
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="flex-1 bg-[#F8F9FA] font-sans">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
        
        {/* Left: Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-12">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-gray-300" placeholder="hello@example.com" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="tel" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-gray-300" placeholder="+880 1XXXXXXXXX" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                  <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">City</label>
                  <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Postal Code</label>
                  <input type="text" required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-white border-2 border-black rounded-xl cursor-pointer shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-[5px] border-black flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">Cash on Delivery</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Pay at door</span>
                </label>
                <label className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors shadow-sm opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                    <span className="font-semibold text-gray-500 text-sm">Credit Card (Coming Soon)</span>
                  </div>
                </label>
              </div>
            </section>

          </form>
        </div>

        {/* Right: Summary */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="bg-white rounded-[2rem] p-8 lg:p-10 border border-gray-100 shadow-sm sticky top-12">
            <h2 className="text-lg font-bold text-gray-900 mb-8 tracking-tight">Order Summary</h2>
            
            <div className="flex flex-col gap-6 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {items.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#F8F9FA] rounded-xl flex items-center justify-center shrink-0 border border-gray-100 p-2 relative">
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white z-10">
                      {item.quantity}
                    </span>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-gray-300">Img</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{item.title}</h4>
                    <span className="text-sm font-medium text-gray-500">{item.quantity} × ৳{item.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-gray-900">৳{shippingEstimate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes</span>
                <span className="font-semibold text-gray-900">৳{taxEstimate.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900 tracking-tight">Total</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8">
              <button type="submit" form="checkout-form" disabled={isProcessing} 
                style={theme?.buttonColors?.buyNow ? { backgroundColor: theme.buttonColors.buyNow } : theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
                className="w-full bg-black text-white px-6 py-5 rounded-full font-bold text-[15px] hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2">
                {isProcessing ? 'Processing Order...' : `Complete Order • ৳${total.toLocaleString()}`}
              </button>
              
              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4" /> Your data is securely encrypted.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
