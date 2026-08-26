'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutClient04({ storeInfo }: { storeInfo?: any }) {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const router = useRouter();
  
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('');

  const deliveryCharge = 120;
  const grandTotal = totalPrice > 0 ? totalPrice + deliveryCharge : 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    try {
      const payload = {
        customerName: fullName,
        customerPhone: phone,
        shippingAddress: `${address}, ${division}`,
        items: cartItems.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        tenantId: storeInfo?._id,
        subTotal: totalPrice,
        shippingCharge: deliveryCharge,
        totalPrice: grandTotal,
        paymentStatus: 'unpaid'
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Checkout failed");
      setStatus('success');
      clearCart();
      setTimeout(() => router.push('/'), 3000);
    } catch {
      setStatus('idle');
      alert("Something went wrong during checkout.");
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
          <p className="text-gray-500 mb-8 font-medium">Thank you for your purchase. We will process your order soon.</p>
          <Link href="/" className="block w-full bg-gray-900 hover:bg-gray-700 transition-colors text-white font-bold py-4 px-8 rounded-full shadow-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <main className="max-w-[1400px] mx-auto px-6 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <div className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
              <h1 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Checkout</h1>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact</h2>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    <input required type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street Address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                    <select required value={division} onChange={e => setDivision(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none">
                      <option value="" disabled>Select Division</option>
                      {['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet', 'Barishal', 'Rangpur', 'Mymensingh'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Payment</h2>
                  <div className="border-2 border-gray-900 rounded-xl p-4 flex items-center justify-between bg-gray-50">
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={14} /></div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:w-96 shrink-0">
            <div className="bg-gray-900 rounded-3xl p-8 text-white sticky top-28 shadow-xl">
              <h2 className="text-xl font-bold mb-8">Order Summary</h2>
              <div className="divide-y divide-gray-800 mb-8 max-h-[300px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 items-center">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded bg-white object-cover p-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white line-clamp-1">{item.title}</div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold">৳{item.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mb-8 text-sm font-medium text-gray-300 border-t border-gray-800 pt-6">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-white">৳{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-white">৳{deliveryCharge.toLocaleString()}</span></div>
                <div className="h-px bg-gray-700 w-full my-4"></div>
                <div className="flex justify-between text-lg font-black text-white"><span>Total</span><span>৳{grandTotal.toLocaleString()}</span></div>
              </div>
              <button form="checkout-form" type="submit" disabled={status === 'processing' || cartItems.length === 0} className="w-full py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-200 transition-colors shadow-md disabled:opacity-50">
                {status === 'processing' ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
