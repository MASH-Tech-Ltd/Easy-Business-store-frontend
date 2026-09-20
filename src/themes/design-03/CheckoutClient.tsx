'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { bdLocations } from '@/data/locations';
import { computeShipping } from '@/utils/shipping';
import { z } from 'zod';
import { getTranslation } from '@/utils/translations';

const checkoutSchema = z.object({
  phone: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, { message: "VALID BD PHONE REQUIRED" }),
  fullName: z.string().min(3, { message: "MIN 3 CHARACTERS REQUIRED" }),
  address: z.string().min(5, { message: "DETAILED ADDRESS REQUIRED" }),
  division: z.string().min(1, { message: "DIVISION SELECTION REQUIRED" }),
  district: z.string().min(1, { message: "DISTRICT SELECTION REQUIRED" }),
  upazila: z.string().min(1, { message: "UPAZILA SELECTION REQUIRED" }),
});

export default function CheckoutClient03({ storeInfo, theme }: { storeInfo?: any; theme?: any }) {
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const { cartItems, totalPrice, clearCart, isInitialized } = useCart();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const manualPaymentMethods = storeInfo?.settings?.manualPaymentMethods?.filter((m: any) => m.isActive) || [];
  
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
  useEffect(() => {
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
      alert("SYSTEM ERROR. CHECKOUT FAILED.");
    }
  };

  useEffect(() => {
    if (isInitialized && cartItems.length === 0 && status !== 'success') {
      router.push('/cart');
    }
  }, [cartItems.length, status, router, isInitialized]);

  if (status === 'success') {
    return (
      <main className="lg:ml-64 flex-1 w-full bg-[#050505] min-h-screen border-l border-white/10 flex items-center justify-center p-6 text-center">
        <div className="bg-[#111] p-12 border border-white/10 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-cyan-400/10 text-cyan-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Transaction Success</h1>
          <p className="text-gray-500 mb-8 font-mono text-sm uppercase">Your order has been recorded into the databank.</p>
          
          {orderId && (
            <div className="bg-white/5 p-4 border border-white/10 mb-8 backdrop-blur-sm">
              <p className="text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">Order Reference</p>
              <p className="font-mono text-cyan-400">#{orderId}</p>
            </div>
          )}

          {manualPaymentMethods.length > 0 && orderId && (
            <div className="mb-8 text-left border border-white/10 bg-[#0a0a0a] max-w-lg w-full mx-auto">
              <div className="bg-[#111] p-4 border-b border-white/10 text-center sm:text-left">
                <h3 className="font-mono text-cyan-400 flex items-center justify-center sm:justify-start gap-2 uppercase tracking-widest text-xs">
                  <Banknote className="w-4 h-4" /> Payment Instructions
                </h3>
                <p className="text-xs text-white/50 mt-2 font-mono">Please complete your payment using one of the methods below.</p>
              </div>
              <div className="p-4 space-y-4">
                {manualPaymentMethods.map((method: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <span className="bg-cyan-400/10 text-cyan-400 text-xs font-mono px-2 py-1 uppercase">{method.provider}</span>
                      <span className="text-[10px] font-mono text-white/50 bg-white/5 px-2 py-1 uppercase">{method.type}</span>
                    </div>
                    <p className="font-mono font-bold text-lg text-white mb-2 text-center sm:text-left">{method.number}</p>
                    {method.instructions && (
                      <p className="text-[10px] text-white/60 bg-[#111] p-3 border border-white/5 font-mono uppercase text-center sm:text-left">{method.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {orderId && (
              <Link href={`/track-order?id=${orderId}`} className="block w-full bg-transparent hover:bg-white/5 transition-colors text-white font-mono uppercase tracking-[0.1em] py-4 px-8 text-xs border border-white/20 hover:border-white">
                Trace Order
              </Link>
            )}
            <Link href="/" className="block w-full bg-cyan-400 hover:bg-white transition-colors text-black font-black uppercase tracking-[0.2em] py-4 px-8 text-xs border border-transparent hover:border-white">
              Return to Root
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!isInitialized || cartItems.length === 0) {
    return null;
  }

  return (
    <main className="lg:ml-64 flex-1 w-full bg-[#050505] min-h-screen border-l border-white/10">
      <div className="w-full px-8 py-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 gap-3 border-b border-white/10 bg-black">
        <Link href="/" className="hover:text-cyan-400 transition-colors">ROOT</Link>
        <span className="text-white/20">/</span>
        <span className="text-white">{t('checkout') || 'Checkout'}</span>
      </div>

      <div className="p-8 md:p-12 border-b border-white/10 bg-black">
        <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase tracking-widest">SECURE PAYMENT</div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">{t('checkout') || 'Checkout'}</h2>
      </div>

      <div className="flex flex-col lg:flex-row h-full">
        <div className="flex-1 lg:border-r border-white/10 p-8 md:p-12">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8 max-w-2xl">
            <div>
              <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">User Identification</h2>
              <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: [] })) }} placeholder="PHONE (e.g. 01712345678)" className={`w-full bg-[#111] border ${fieldErrors.phone?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase`} />
              {fieldErrors.phone?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.phone[0]}</p>}
            </div>
            <div>
              <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Shipping Coordinates</h2>
              <div className="space-y-4">
                <div>
                  <input type="text" value={fullName} onChange={e => { setFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: [] })) }} placeholder="FULL NAME" className={`w-full bg-[#111] border ${fieldErrors.fullName?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase`} />
                  {fieldErrors.fullName?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.fullName[0]}</p>}
                </div>
                <div>
                  <input type="text" value={address} onChange={e => { setAddress(e.target.value); if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: [] })) }} placeholder="STREET ADDRESS" className={`w-full bg-[#111] border ${fieldErrors.address?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase`} />
                  {fieldErrors.address?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.address[0]}</p>}
                </div>
                <div>
                  <select value={division} onChange={e => { setDivision(e.target.value); setDistrict(''); setUpazila(''); if (fieldErrors.division) setFieldErrors(prev => ({ ...prev, division: [] })) }} className={`w-full bg-[#111] border ${fieldErrors.division?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase appearance-none`}>
                    <option value="" disabled>SELECT REGION</option>
                    {divisionsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {fieldErrors.division?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.division[0]}</p>}
                </div>
                {division && (
                  <div>
                    <select value={district} onChange={e => { setDistrict(e.target.value); setUpazila(''); if (fieldErrors.district) setFieldErrors(prev => ({ ...prev, district: [] })) }} className={`w-full bg-[#111] border ${fieldErrors.district?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase appearance-none`}>
                      <option value="" disabled>SELECT SECTOR</option>
                      {districtsList.map(d => <option key={d.district} value={d.district}>{d.district}</option>)}
                    </select>
                    {fieldErrors.district?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.district[0]}</p>}
                  </div>
                )}
                {district && (
                  <div>
                    <select value={upazila} onChange={e => { setUpazila(e.target.value); if (fieldErrors.upazila) setFieldErrors(prev => ({ ...prev, upazila: [] })) }} className={`w-full bg-[#111] border ${fieldErrors.upazila?.length ? 'border-red-500' : 'border-white/10'} text-white px-4 py-4 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors uppercase appearance-none`}>
                      <option value="" disabled>SELECT SUB-SECTOR</option>
                      {upazilasList.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    {fieldErrors.upazila?.[0] && <p className="text-[10px] text-red-500 mt-2 font-mono uppercase">{fieldErrors.upazila[0]}</p>}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        
        <div className="w-full lg:w-96 bg-black p-8 border-t lg:border-t-0 border-white/10 flex flex-col">
          <h3 className="text-xs font-mono text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Transaction Summary</h3>
          <div className="space-y-4 font-mono text-sm text-gray-400 mb-8 flex-1">
            <div className="flex justify-between uppercase">
              <span>{t('subtotal') || 'Subtotal'}</span>
              <span className="text-white">{theme?.currencySymbol || '৳'}{' '}{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span>Logistics {shippingZoneName ? `(${shippingZoneName})` : ''}</span>
              <span className="text-white">{theme?.currencySymbol || '৳'}{' '}{deliveryCharge.toLocaleString()}</span>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 mb-8">
            <div className="flex justify-between items-end">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Total Required</span>
              <span className="text-3xl font-black text-cyan-400 tracking-tighter">{theme?.currencySymbol || '৳'}{' '}{grandTotal.toLocaleString()}</span>
            </div>
          </div>
          <button 
            type="submit" 
            form="checkout-form" 
            disabled={status === 'processing'}
            className="w-full bg-cyan-400 text-black font-black uppercase tracking-[0.2em] py-4 text-xs hover:bg-white transition-colors disabled:opacity-50 border border-transparent hover:border-white"
          >
            {status === 'processing' ? 'PROCESSING...' : 'CONFIRM TRANSACTION'}
          </button>
        </div>
      </div>
    </main>
  );
}
