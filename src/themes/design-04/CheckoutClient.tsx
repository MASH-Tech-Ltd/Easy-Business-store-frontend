'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { bdLocations } from '@/data/locations';
import { computeShipping } from '@/utils/shipping';
import { z } from 'zod';
import { getTranslation } from '@/utils/translations';

const checkoutSchema = z.object({
  phone: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, { message: "Please enter a valid BD phone number (e.g. 01712345678)" }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters long" }),
  address: z.string().min(5, { message: "Please provide a detailed address" }),
  division: z.string().min(1, { message: "Please select a division" }),
  district: z.string().min(1, { message: "Please select a district" }),
  upazila: z.string().min(1, { message: "Please select a subdistrict/thana" }),
});

export default function CheckoutClient04({ storeInfo, theme }: { storeInfo?: any; theme?: any }) {
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');

  const divisionsList = bdLocations.map((d) => d.division);
  const districtsList = bdLocations.find((d) => d.division === division)?.districts || [];
  const upazilasList = districtsList.find((d) => d.district === district)?.upazilas || [];

  // Track Checkout Leads (Abandoned Checkout)
  React.useEffect(() => {
    if (!phone && !fullName && !address) return;
    if (status === 'success' || status === 'processing') return;

    const timeoutId = setTimeout(() => {
      fetch('/api/checkout-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: fullName.split(' ')[0] || fullName,
          lastName: fullName.split(' ').slice(1).join(' ') || undefined,
          phone,
          address,
          division,
          district,
          upazila,
          status: 'abandoned'
        })
      }).catch(err => console.error("Failed to track lead", err));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [phone, fullName, address, division, district, upazila, status]);

  const { cost: deliveryCharge, zoneName: shippingZoneName } = computeShipping(division, district, theme?.shippingZones || [], theme?.defaultShippingCost ?? 120);
  const grandTotal = totalPrice > 0 ? totalPrice + deliveryCharge : 0;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkoutSchema.safeParse({ phone, fullName, address, division, district, upazila });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }
    setFieldErrors({});

    setStatus('processing');
    try {
      const payload = {
        customerName: fullName,
        customerPhone: phone,
        shippingAddress: `${address}, ${upazila}, ${district}, ${division}`,
        items: cartItems.map(item => ({
          productId: item.id || (item as any)._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        
        subTotal: totalPrice,
        shippingCharge: deliveryCharge,
        totalPrice: grandTotal,
        paymentStatus: 'unpaid'
      };

      const res = await fetch(`/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");
      
      if (data?.data) {
        setOrderId(data.data.orderId);
      }
      
      setStatus('success');
      clearCart();
    } catch {
      setStatus('idle');
      alert("Something went wrong during checkout.");
    }
  };

  if (!mounted) return null;

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-3xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Order Confirmed!</h1>
          <p className="text-gray-500 mb-8 font-medium">Thank you for your purchase. We will process your order soon.</p>
          
          {orderId && (
            <div className="bg-gray-50 rounded-full py-3 px-6 mb-8 inline-block border border-gray-200">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Order Number</p>
              <p className="font-mono text-gray-900 font-bold">#{orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            {orderId && (
              <Link href={`/track-order?id=${orderId}`} className="block w-full bg-black hover:bg-gray-800 transition-colors text-white font-bold py-4 px-8 rounded-full shadow-sm">
                Track Order
              </Link>
            )}
            <Link href="/" className="block w-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-900 font-bold py-4 px-8 rounded-full shadow-sm">
              Continue Shopping
            </Link>
          </div>
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
              <h1 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">{t('checkout') || 'Checkout'}</h1>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t('contact') || 'Contact'}</h2>
                  <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: [] })) }} placeholder="Phone Number" className={`w-full bg-gray-50 border ${fieldErrors.phone?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900`} />
                  {fieldErrors.phone?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone[0]}</p>}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Shipping Address</h2>
                  <div className="space-y-4">
                    <div>
                      <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: [] })) }} placeholder="Full Name" className={`w-full bg-gray-50 border ${fieldErrors.fullName?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900`} />
                      {fieldErrors.fullName?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.fullName[0]}</p>}
                    </div>
                    <div>
                      <input type="text" value={address} onChange={e => { setAddress(e.target.value); if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: [] })) }} placeholder="Street Address" className={`w-full bg-gray-50 border ${fieldErrors.address?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900`} />
                      {fieldErrors.address?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.address[0]}</p>}
                    </div>
                    <div>
                      <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(''); setUpazila(''); if (fieldErrors.division) setFieldErrors(prev => ({ ...prev, division: [] })) }} className={`w-full bg-gray-50 border ${fieldErrors.division?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none`}>
                        <option value="" disabled>Select Division</option>
                        {divisionsList.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {fieldErrors.division?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.division[0]}</p>}
                    </div>
                    {division && (
                      <div>
                        <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(''); if (fieldErrors.district) setFieldErrors(prev => ({ ...prev, district: [] })) }} className={`w-full bg-gray-50 border ${fieldErrors.district?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none`}>
                          <option value="" disabled>Select District</option>
                          {districtsList.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                        </select>
                        {fieldErrors.district?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.district[0]}</p>}
                      </div>
                    )}
                    {district && (
                      <div>
                        <select value={upazila} onChange={e => { setUpazila(e.target.value); if (fieldErrors.upazila) setFieldErrors(prev => ({ ...prev, upazila: [] })) }} className={`w-full bg-gray-50 border ${fieldErrors.upazila?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none`}>
                          <option value="" disabled>Select Subdistrict / Thana</option>
                          {upazilasList.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {fieldErrors.upazila?.[0] && <p className="text-xs text-red-500 mt-1">{fieldErrors.upazila[0]}</p>}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">{t('paymentOptions') || 'Payment'}</h2>
                  <div className="border-2 border-gray-900 rounded-xl p-4 flex items-center justify-between bg-gray-50">
                    <span className="font-bold text-gray-900">Cash on Delivery</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        {shippingZoneName ? `${shippingZoneName} ` : ''}+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {theme?.currencySymbol || '৳'}
                      </span>
                      <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white shrink-0"><CheckCircle2 size={14} /></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:w-96 shrink-0">
            <div className="bg-gray-900 rounded-3xl p-8 text-white sticky top-28 shadow-xl">
              <h2 className="text-xl font-bold mb-8">{t('orderSummary') || 'Order Summary'}</h2>
              <div className="divide-y divide-gray-800 mb-8 max-h-[300px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 items-center">
                    <img src={item.image} alt={item.title} className="w-12 h-12 rounded bg-white object-cover p-1" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white line-clamp-1">{item.title}</div>
                      <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold">{theme?.currencySymbol || '৳'}{' '}{item.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 mb-8 text-sm font-medium text-gray-300 border-t border-gray-800 pt-6">
                <div className="flex justify-between"><span>{t('subtotal') || 'Subtotal'}</span><span className="text-white">{theme?.currencySymbol || '৳'}{' '}{totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>{t('shipping') || 'Shipping'} {shippingZoneName ? `(${shippingZoneName})` : ''}</span><span className="text-white">{theme?.currencySymbol || '৳'}{' '}{deliveryCharge.toLocaleString()}</span></div>
                <div className="h-px bg-gray-700 w-full my-4"></div>
                <div className="flex justify-between text-lg font-black text-white"><span>{t('total') || 'Total'}</span><span>{theme?.currencySymbol || '৳'}{' '}{grandTotal.toLocaleString()}</span></div>
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
