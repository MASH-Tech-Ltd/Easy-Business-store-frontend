'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Check, ShieldCheck, ChevronRight, Banknote } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { bdLocations } from '@/data/locations';
import { z } from 'zod';
import { getTranslation } from '@/utils/translations';
import { computeShipping } from '@/utils/shipping';

const checkoutSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  phone: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, { message: "Please enter a valid BD phone number (e.g. 01712345678)" }),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters long" }),
  address: z.string().min(5, { message: "Please provide a detailed address" }),
  division: z.string().min(1, { message: "Please select a division" }),
  district: z.string().min(1, { message: "Please select a district" }),
  upazila: z.string().min(1, { message: "Please select a subdistrict/thana" }),
});

export default function CheckoutClient05({ theme, storeInfo }: { theme?: any; storeInfo?: any }) {
  const language = storeInfo?.language || "en";
  const t = (key: any) => getTranslation(language || 'en', key);


  const { cartItems: items, totalPrice: subtotal, clearCart, isInitialized } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const manualPaymentMethods = storeInfo?.settings?.manualPaymentMethods?.filter((m: any) => m.isActive) || [];

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  
  const divisionsList = bdLocations.map((d) => d.division);
  const districtsList = bdLocations.find((d) => d.division === division)?.districts || [];
  const upazilasList = districtsList.find((d) => d.district === district)?.upazilas || [];

  // Track Checkout Leads (Abandoned Checkout)
  React.useEffect(() => {
    if (!phone && !firstName && !address) return;
    if (isSuccess || isProcessing) return;

    const timeoutId = setTimeout(() => {
      fetch('/api/checkout-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
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
  }, [phone, firstName, lastName, email, address, division, district, upazila, isSuccess, isProcessing]);

  const { cost: shippingEstimate, zoneName: shippingZoneName } = computeShipping(division, district, theme?.shippingZones || [], theme?.defaultShippingCost ?? 120);
  const taxEstimate = 0;
  const total = Math.round(subtotal + shippingEstimate + taxEstimate);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const result = checkoutSchema.safeParse({ email, phone, firstName, lastName, address, division, district, upazila });
    if (!result.success) {
      setFieldErrors(result.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }
    setFieldErrors({});

    setIsProcessing(true);
    try {
      const payload = {
        customerName: `${firstName} ${lastName}`.trim(),
        customerPhone: phone,
        shippingAddress: `${address}, ${upazila}, ${district}, ${division}`,
        items: items.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item as any).images?.[0]?.secure_url
        })),
        
        subTotal: subtotal,
        shippingCharge: shippingEstimate,
        totalPrice: total,
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
      
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Something went wrong during checkout. Please try again.");
    }
  };

  React.useEffect(() => {
    if (isInitialized && items.length === 0 && !isSuccess) {
      router.push('/cart');
    }
  }, [items.length, isSuccess, router, isInitialized]);

  if (isSuccess) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100">
          <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Order Confirmed</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Thank you for your purchase. We've received your order and will email you the confirmation details shortly.
        </p>

          {orderId && (
            <div className="bg-gray-50 rounded-xl py-4 px-6 mb-8 inline-block border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold text-center">Order Number</p>
              <p className="font-mono text-gray-900 font-bold text-center text-lg">#{orderId}</p>
            </div>
          )}

          {manualPaymentMethods.length > 0 && orderId && (
            <div className="mb-10 text-left border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm max-w-lg w-full mx-auto">
              <div className="bg-gray-50 p-5 border-b border-gray-200 text-center sm:text-left">
                <h3 className="font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
                  <Banknote className="w-5 h-5 text-[#5022C3]" /> Payment Instructions
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Please complete your payment using one of the methods below.</p>
              </div>
              <div className="p-5 space-y-4">
                {manualPaymentMethods.map((method: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
                      <span className="bg-[#5022C3] text-white text-xs font-bold px-3 py-1 rounded-full">{method.provider}</span>
                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">{method.type}</span>
                    </div>
                    <p className="font-mono font-black text-xl text-gray-900 mb-2 text-center sm:text-left tracking-tight">{method.number}</p>
                    {method.instructions && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center sm:text-left font-medium">{method.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          {orderId && (
            <Link prefetch={false} href={`/track-order?id=${orderId}`} 
              className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors w-full sm:w-auto">
              Track Order
            </Link>
          )}
          <Link prefetch={false} href="/" 
            style={theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
            className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors w-full sm:w-auto">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  if (!isInitialized || (items.length === 0 && !isSuccess)) {
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
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: [] })) }} className={`w-full bg-white border ${fieldErrors.email?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-gray-300`} placeholder="hello@example.com" />
                  {fieldErrors.email?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.email[0]}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => { setPhone(e.target.value); if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: [] })) }} className={`w-full bg-white border ${fieldErrors.phone?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm placeholder:text-gray-300`} placeholder="+880 1XXXXXXXXX" />
                  {fieldErrors.phone?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.phone[0]}</p>}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: [] })) }} className={`w-full bg-white border ${fieldErrors.firstName?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm`} />
                  {fieldErrors.firstName?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.firstName[0]}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: [] })) }} className={`w-full bg-white border ${fieldErrors.lastName?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm`} />
                  {fieldErrors.lastName?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.lastName[0]}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Street Address</label>
                  <input type="text" value={address} onChange={e => { setAddress(e.target.value); if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: [] })) }} className={`w-full bg-white border ${fieldErrors.address?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm`} />
                  {fieldErrors.address?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.address[0]}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Division</label>
                  <select value={division} onChange={(e) => { setDivision(e.target.value); setDistrict(''); setUpazila(''); if (fieldErrors.division) setFieldErrors(prev => ({ ...prev, division: [] })) }} className={`w-full bg-white border ${fieldErrors.division?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm appearance-none`}>
                    <option value="" disabled>Select Division</option>
                    {divisionsList.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {fieldErrors.division?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.division[0]}</p>}
                </div>
                {division && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">District</label>
                    <select value={district} onChange={(e) => { setDistrict(e.target.value); setUpazila(''); if (fieldErrors.district) setFieldErrors(prev => ({ ...prev, district: [] })) }} className={`w-full bg-white border ${fieldErrors.district?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm appearance-none`}>
                      <option value="" disabled>Select District</option>
                      {districtsList.map(d => (
                        <option key={d.district} value={d.district}>{d.district}</option>
                      ))}
                    </select>
                    {fieldErrors.district?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.district[0]}</p>}
                  </div>
                )}
                {district && (
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subdistrict / Thana</label>
                    <select value={upazila} onChange={(e) => { setUpazila(e.target.value); if (fieldErrors.upazila) setFieldErrors(prev => ({ ...prev, upazila: [] })) }} className={`w-full bg-white border ${fieldErrors.upazila?.length ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm appearance-none`}>
                      <option value="" disabled>Select Subdistrict</option>
                      {upazilasList.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                    {fieldErrors.upazila?.[0] && <p className="text-xs text-red-500 mt-2 font-medium">{fieldErrors.upazila[0]}</p>}
                  </div>
                )}
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
                  <span className="text-xs font-bold text-gray-900">
                    {shippingZoneName ? `${shippingZoneName} ` : ''}+{subtotal > 0 ? shippingEstimate.toLocaleString() : 0} {theme?.currencySymbol || '৳'}
                  </span>
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
            <h2 className="text-lg font-bold text-gray-900 mb-8 tracking-tight">{t('orderSummary') || 'Order Summary'}</h2>
            
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
                    <span className="text-sm font-medium text-gray-500">{item.quantity} × {theme?.currencySymbol || '৳'} {Math.round(item.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('subtotal') || 'Subtotal'}</span>
                <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {Math.round(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('shipping') || 'Shipping'} {shippingZoneName ? `(${shippingZoneName})` : ''}</span>
                <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {shippingEstimate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes</span>
                <span className="font-semibold text-gray-900">{theme?.currencySymbol || '৳'} {taxEstimate.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900 tracking-tight">{t('total') || 'Total'}</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">{theme?.currencySymbol || '৳'} {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8">
              <button type="submit" form="checkout-form" disabled={isProcessing} 
                style={theme?.buttonColors?.buyNow ? { backgroundColor: theme.buttonColors.buyNow } : theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
                className="w-full bg-black text-white px-6 py-5 rounded-full font-bold text-[15px] hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2">
                {isProcessing ? 'Processing Order...' : `Complete Order • ${theme?.currencySymbol || '৳'} ${total.toLocaleString()}`}
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
