'use client';

import React, { useState } from 'react';
import { trackEvent } from '@/utils/tracking';
import { useCheckoutLeadTracker } from '@/hooks/useCheckoutLeadTracker';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Check, ShieldCheck, ChevronRight, Banknote, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { bdLocations } from '@/data/locations';
import { z } from 'zod';
import { getTranslation } from '@/utils/translations';
import { getCheckoutThumbnailUrl } from '@/utils/imageOptimizer';
import { computeShipping } from '@/utils/shipping';
import {
  getSavedCustomerInfo,
  saveCustomerInfo,
} from '@/utils/customerStorage';
import { handleCheckoutError } from '@/utils/checkoutErrorHandler';

const checkoutSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  phone: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, {
    message: 'Please enter a valid BD phone number (e.g. 01712345678)',
  }),
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters long' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters long' }),
  address: z.string().min(5, { message: 'Please provide a detailed address' }),
  division: z.string().min(1, { message: 'Please select a division' }),
  district: z.string().min(1, { message: 'Please select a district' }),
  upazila: z.string().min(1, { message: 'Please select a subdistrict/thana' }),
});

export default function CheckoutClient06({
  theme,
  storeInfo,
}: {
  theme?: any;
  storeInfo?: any;
}) {
  const language = storeInfo?.language || 'en';
  const t = (key: any) => getTranslation(language || 'en', key);

  const {
    cartItems: items,
    totalPrice: subtotal,
    clearCart,
    removeFromCart,
    isInitialized,
  } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const manualPaymentMethods =
    storeInfo?.settings?.manualPaymentMethods?.filter((m: any) => m.isActive) || [];

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');

  // Auto-fill customer details from localStorage
  React.useEffect(() => {
    try {
      const saved = getSavedCustomerInfo();
      if (saved) {
        if (saved.email) setEmail(saved.email);
        if (saved.phone) setPhone(saved.phone);
        if (saved.firstName) setFirstName(saved.firstName);
        if (saved.lastName) setLastName(saved.lastName);
        if (saved.address) setAddress(saved.address);
        if (saved.division) setDivision(saved.division);
        if (saved.district) setDistrict(saved.district);
        if (saved.upazila) setUpazila(saved.upazila);
      }
    } catch {}
  }, []);

  // Location lists
  const divisionsList = bdLocations.map((d) => d.division);
  const districtsList =
    bdLocations.find((d) => d.division === division)?.districts || [];
  const upazilasList =
    districtsList.find((d) => d.district === district)?.upazilas || [];

  // Shipping calculation
  const { cost: shippingEstimate } = computeShipping(
    division,
    district,
    theme?.shippingZones || [],
    theme?.defaultShippingCost ?? 120
  );
  const total = Math.round(subtotal + shippingEstimate);

  // Lead tracker
  useCheckoutLeadTracker({
    firstName,
    lastName,
    email,
    phone,
    address,
    division,
    district,
    upazila,
    items: items.map((item) => ({
      productId: item.productId || item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      color: item.color,
      size: item.size,
    })),
    isSuccess,
    isProcessing,
  });

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    setDistrict('');
    setUpazila('');
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setUpazila('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = checkoutSchema.safeParse({
      email,
      phone,
      firstName,
      lastName,
      address,
      division,
      district,
      upazila,
    });
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
        customerEmail: email || undefined,
        shippingAddress: `${address}, ${upazila}, ${district}, ${division}`,
        items: items.map((item) => ({
          productId: item.productId || item.id,
          variantId: item.variantId,
          color: item.color,
          size: item.size,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item as any).images?.[0]?.secure_url,
        })),
        subTotal: subtotal,
        shippingCharge: shippingEstimate,
        totalPrice: total,
        paymentStatus: 'unpaid',
      };

      const res = await fetch(`/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Checkout failed');

      if (data?.data) {
        setOrderId(data.data.orderId);
      }

      saveCustomerInfo({
        email,
        phone,
        firstName,
        lastName,
        address,
        division,
        district,
        upazila,
      });

      trackEvent('purchase', {
        orderId: data?.data?.orderId || data?.data?._id || '',
        value: total,
        currency: 'BDT',
        items: items.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      handleCheckoutError(error, items, removeFromCart);
    }
  };

  React.useEffect(() => {
    if (isInitialized && items.length === 0 && !isSuccess) {
      router.push('/cart');
    }
  }, [items.length, isSuccess, router, isInitialized]);

  if (isSuccess) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center p-6 text-center py-20">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
          <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Thank you for choosing our boutique collection. We have received your order and our concierge team will dispatch it shortly.
        </p>

        {orderId && (
          <div className="bg-[#FAFAFA] rounded-2xl py-4 px-8 mb-8 inline-block border border-gray-200">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-1 font-bold">
              Your Order Number
            </p>
            <p className="font-mono text-gray-900 font-bold text-xl">
              #{orderId}
            </p>
          </div>
        )}

        {manualPaymentMethods.length > 0 && orderId && (
          <div className="mb-8 text-left border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs max-w-md w-full mx-auto">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Banknote className="w-4 h-4 text-black" /> Payment Instructions
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {manualPaymentMethods.map((method: any, idx: number) => (
                <div key={idx} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="bg-black text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {method.provider}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {method.type}
                    </span>
                  </div>
                  <p className="font-mono font-bold text-base text-gray-900">
                    {method.number}
                  </p>
                  {method.instructions && (
                    <p className="text-xs text-gray-600 mt-1">
                      {method.instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-sm">
          {orderId && (
            <Link
              prefetch={false}
              href={`/track-order?id=${orderId}`}
              className="bg-black text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
            >
              Track Order
            </Link>
          )}
          <Link
            prefetch={false}
            href="/"
            className="bg-gray-100 text-gray-800 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white py-8 sm:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12 tracking-tight">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Customer & Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
              <h2 className="font-heading text-xl font-bold text-gray-900 pb-3 border-b border-gray-200">
                1. Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Fatima"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.firstName[0]}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Rahman"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.lastName[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.phone[0]}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              {/* Bangladesh Location Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Division *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    {divisionsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {districtsList.map((d) => (
                      <option key={d.district} value={d.district}>{d.district}</option>
                    ))}
                  </select>
                  {fieldErrors.district && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.district[0]}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                    Thana / Upazila *
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    required
                    disabled={!district}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black cursor-pointer disabled:bg-gray-100"
                  >
                    <option value="">Select Thana</option>
                    {upazilasList.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {fieldErrors.upazila && (
                    <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.upazila[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Detailed Address (House, Road, Area) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House 12, Road 4, Sector 7, Uttara, Dhaka"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-black"
                />
                {fieldErrors.address && (
                  <p className="text-[11px] text-rose-600 mt-1">{fieldErrors.address[0]}</p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
              <h2 className="font-heading text-xl font-bold text-gray-900 pb-3 border-b border-gray-200">
                2. Payment Method
              </h2>
              <div className="border-2 border-black rounded-xl p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-black flex items-center justify-center" />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500">Pay cash upon receiving your boutique parcel.</p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-gray-800" />
              </div>
            </div>
          </div>

          {/* Order Summary & Submit Button (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6 sticky top-28">
              <h3 className="font-heading text-lg font-bold text-gray-900 pb-3 border-b border-gray-200">
                Order Review ({items.length} items)
              </h3>

              {/* Items preview */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-100">
                {items.map((it) => (
                  <div key={it.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <div className="w-12 h-14 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      {it.image ? (
                        <img src={getCheckoutThumbnailUrl(it.image)} alt={it.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-300">Pic</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{it.title}</p>
                      {(it.color || it.size) && (
                        <p className="text-[10px] text-gray-500">
                          {it.color ? `Color: ${it.color}` : ''}
                          {it.color && it.size ? ' • ' : ''}
                          {it.size ? `Size: ${it.size}` : ''}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-0.5">
                        Qty: {it.quantity} × {theme?.currencySymbol || '৳'} {it.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {theme?.currencySymbol || '৳'} {(it.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2.5 pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {theme?.currencySymbol || '৳'}{' '}{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({division})</span>
                  <span className="font-semibold text-gray-900">
                    {shippingEstimate > 0 ? `${theme?.currencySymbol || '৳'} ${shippingEstimate.toLocaleString()}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl">
                    {theme?.currencySymbol || '৳'}{' '}{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-black hover:bg-gray-800 text-white rounded-full font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? 'Processing Order...' : 'Confirm Order (Cash on Delivery)'}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Secured & Verified Cash on Delivery</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
