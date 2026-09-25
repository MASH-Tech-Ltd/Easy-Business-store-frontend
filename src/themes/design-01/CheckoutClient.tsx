"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Minus,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Banknote,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTranslation } from "@/context/LanguageContext";
import { z } from "zod";
import { bdLocations } from "@/data/locations";
import { computeShipping } from "@/utils/shipping";
import { getTranslation } from '@/utils/translations';

const checkoutSchema = z.object({
  phone: z.string().regex(/^(?:\+88|88)?01[3-9]\d{8}$/, { message: "Please enter a valid BD phone number (e.g. 01712345678)" }),
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" }),
  address: z.string().min(5, { message: "Please provide a detailed address" }),
  division: z.string().min(1, { message: "Please select a division" }),
  district: z.string().min(1, { message: "Please select a district" }),
  upazila: z.string().min(1, { message: "Please select a subdistrict/thana" }),
});

export default function CheckoutClient({ storeInfo, theme }: { storeInfo?: any; theme?: any }) {


  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "processing" | "success">(
    "idle",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [mounted, setMounted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  const manualPaymentMethods = storeInfo?.settings?.manualPaymentMethods?.filter((m: any) => m.isActive) || [];

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Auto-fill customer details from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("customerInfo");
      if (saved) {
        const info = JSON.parse(saved);
        if (info.phone) setPhone(info.phone);
        if (info.fullName) setFullName(info.fullName);
        if (info.address) setAddress(info.address);
        if (info.division) setDivision(info.division);
      }
    } catch (error) {
      console.error("Failed to load customer info", error);
    }
  }, []);

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

  // Scroll to top when checkout is successful
  React.useEffect(() => {
    if (status === "success") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status]);

  // Static Location Derived Data
  const divisionsList = bdLocations.map(d => d.division);
  const districtsList = bdLocations.find(d => d.division === division)?.districts || [];
  const upazilasList = districtsList.find(d => d.district === district)?.upazilas || [];

  const { cost: deliveryCharge, zoneName: shippingZoneName } = computeShipping(division, district, theme?.shippingZones || [], theme?.defaultShippingCost ?? 120);
  const grandTotal = totalPrice > 0 ? totalPrice + deliveryCharge : 0;

  const handleCheckout = async () => {
    const result = checkoutSchema.safeParse({
      phone,
      fullName,
      address,
      division,
      district,
      upazila,
    });
    if (!result.success) {
      setFieldErrors(
        result.error.flatten().fieldErrors as Record<string, string[]>,
      );
      
      // Auto-scroll to the first field with an error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.border-red-500');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return;
    }

    setFieldErrors({});
    setStatus("processing");
    try {
      const payload = {
        customerName: fullName,
        customerPhone: phone,
        shippingAddress: `${address}, ${upazila}, ${district}, ${division}`,
        note: deliveryNote,
        items: cartItems.map((item) => ({
          productId: item.id || (item as any)._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        
        subTotal: totalPrice,
        shippingCharge: deliveryCharge,
        totalPrice: grandTotal,
        paymentStatus: "unpaid",
      };

      const res = await fetch(
        `/api/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Checkout failed");
      
      if (data?.data) {
        setOrderId(data.data.orderId);
      }

      // Save customer info for future auto-fill
      try {
        localStorage.setItem(
          "customerInfo",
          JSON.stringify({
            phone,
            fullName,
            address,
            division,
          }),
        );
      } catch (err) {
        console.error("Failed to save customer info", err);
      }

      setStatus("success");
      clearCart();
    } catch (e: any) {
      console.error(e);
      setStatus("idle");
      
      const errorMessage = e.message || "";
      if (errorMessage.includes("Product not found or does not belong to this tenant")) {
        alert("Your cart contains products that are no longer available. Your cart will be cleared.");
        clearCart();
      } else {
        alert(errorMessage || "Something went wrong during checkout. Please try again.");
      }
    }
  };

  if (!mounted) return null;

  if (status === "success") {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
        <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-sm text-center max-w-md w-full mx-auto my-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            {t("orderConfirmed")}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">{t("thankYouPurchase")}</p>
          
          {orderId && (
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono text-lg sm:text-xl font-bold text-gray-900">#{orderId}</p>
            </div>
          )}

          {manualPaymentMethods.length > 0 && orderId && (
            <div className="mb-6 sm:mb-8 text-left border border-purple-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-purple-50 p-3 sm:p-4 border-b border-purple-100">
                <h3 className="font-bold text-sm sm:text-base text-purple-900 flex items-center gap-2">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5" /> Payment Instructions
                </h3>
                <p className="text-xs sm:text-sm text-purple-700 mt-1">Please complete your payment using one of the methods below.</p>
              </div>
              <div className="p-3 sm:p-4 space-y-4">
                {manualPaymentMethods.map((method: any, idx: number) => (
                  <div key={idx} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#5022C3] text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded">{method.provider}</span>
                      <span className="text-[10px] sm:text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">{method.type}</span>
                    </div>
                    <p className="font-mono font-bold text-base sm:text-lg text-gray-900 mb-2">{method.number}</p>
                    {method.instructions && (
                      <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100">{method.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {orderId && (
              <Link prefetch={false}
                href={`/track-order?id=${orderId}`}
                className="block w-full bg-black hover:bg-gray-800 transition-colors text-white font-bold py-3.5 sm:py-4 px-4 sm:px-8 rounded-xl text-sm sm:text-base"
              >
                Track Order
              </Link>
            )}
            <Link prefetch={false}
              href="/"
              className="block w-full bg-primary hover:opacity-90 transition-opacity text-white font-bold py-3.5 sm:py-4 px-4 sm:px-8 rounded-xl text-sm sm:text-base"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-8 md:p-6 lg:p-12 flex flex-col md:flex-row gap-8 md:gap-6 lg:gap-20">
          {/* Left Column: Form */}
          <div className="flex-1 space-y-8 sm:space-y-10 min-w-0">
            <h1 className="text-xl font-bold text-primary">
              {t("placeOrder")}
            </h1>

            {/* Contact */}
            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("contact")}
              </h2>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                  {t("phoneNumber")}
                </label>
                <div
                  className={`flex rounded-md border bg-white overflow-hidden focus-within:ring-1 focus-within:ring-primary ${fieldErrors.phone?.length ? "border-red-500" : "border-gray-200"}`}
                >
                  <div className="flex items-center px-4 border-r border-gray-200 bg-gray-50 shrink-0">
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-700 rounded-full flex items-center justify-center overflow-hidden">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      </div>
                      (+880)
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone)
                        setFieldErrors((prev) => ({ ...prev, phone: [] }));
                    }}
                    placeholder="Phone number"
                    className="flex-1 min-w-0 block w-full px-4 py-3 text-sm focus:outline-none"
                  />
                </div>
                {fieldErrors.phone?.[0] && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldErrors.phone[0]}
                  </p>
                )}
              </div>
            </section>

            {/* Personal Info */}
            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("personalInfo")}
              </h2>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {t("fullName")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName)
                        setFieldErrors((prev) => ({ ...prev, fullName: [] }));
                    }}
                    placeholder="Full Name"
                    className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${fieldErrors.fullName?.length ? "border-red-500" : "border-gray-200"}`}
                  />
                  {fieldErrors.fullName?.[0] && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.fullName[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {t("address")}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (fieldErrors.address)
                        setFieldErrors((prev) => ({ ...prev, address: [] }));
                    }}
                    placeholder="Address"
                    className={`block w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary ${fieldErrors.address?.length ? "border-red-500" : "border-gray-200"}`}
                  />
                  {fieldErrors.address?.[0] && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.address[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                    {t("selectDivision")}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value);
                      setDistrict("");
                      setUpazila("");
                      if (fieldErrors.division)
                        setFieldErrors((prev) => ({ ...prev, division: [] }));
                    }}
                    className={`block w-full px-4 py-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none ${fieldErrors.division?.length ? "border-red-500" : "border-gray-200"}`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                    }}
                  >
                    <option value="" disabled>
                      {t("selectDivision")}
                    </option>
                    {divisionsList.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.division?.[0] && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.division[0]}
                    </p>
                  )}
                </div>

                {division && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Select District
                    </label>
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setUpazila("");
                        if (fieldErrors.district)
                          setFieldErrors((prev) => ({ ...prev, district: [] }));
                      }}
                      className={`block w-full px-4 py-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none ${fieldErrors.district?.length ? "border-red-500" : "border-gray-200"}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="" disabled>Select District</option>
                      {districtsList.map((dist) => (
                        <option key={dist.district} value={dist.district}>
                          {dist.district}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.district?.[0] && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.district[0]}
                      </p>
                    )}
                  </div>
                )}

                {district && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
                      Select Subdistrict / Thana
                    </label>
                    <select
                      value={upazila}
                      onChange={(e) => {
                        setUpazila(e.target.value);
                        if (fieldErrors.upazila)
                          setFieldErrors((prev) => ({ ...prev, upazila: [] }));
                      }}
                      className={`block w-full px-4 py-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none ${fieldErrors.upazila?.length ? "border-red-500" : "border-gray-200"}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                      }}
                    >
                      <option value="" disabled>Select Subdistrict</option>
                      {upazilasList.map((upz) => (
                        <option key={upz} value={upz}>
                          {upz}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.upazila?.[0] && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.upazila[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Payment Options */}
            <section>
              <h2 className="text-sm font-bold text-gray-900 mb-4">
                {t("paymentOptions")}
              </h2>
              <div className="border border-primary bg-gray-50 rounded-lg p-5 relative cursor-pointer flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-gray-900 text-sm">
                    {t("cashOnDelivery")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-primary">
                    {shippingZoneName ? `${shippingZoneName} ` : ''}+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {t("bdt")}
                  </span>
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {storeInfo?.settings?.checkoutNote && (
                <div className="mt-5 space-y-1">
                  <p className="text-[11px] font-semibold text-primary whitespace-pre-line">
                    {storeInfo.settings.checkoutNote}
                  </p>
                  <p className="text-[11px] font-bold text-primary uppercase">
                    {storeInfo.name} ✨
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="flex-1 lg:flex-none lg:w-[480px] shrink-0 flex flex-col relative before:hidden md:before:block before:absolute before:-left-3 lg:before:-left-10 before:top-0 before:bottom-0 before:w-[1px] before:bg-gray-200">
            <div className="flex-1 space-y-8">
              {/* Cart Items List */}
              <div>
                <div className="max-h-[400px] overflow-y-auto pr-2 divide-y divide-gray-100">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      {t("yourCartIsEmpty")}
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex gap-4 items-center first:pt-0"
                      >
                        <div className="w-14 h-14 bg-white rounded overflow-hidden shrink-0 border border-gray-100 p-1">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-[13px] font-semibold text-gray-900 truncate">
                            {item.title}
                          </h4>
                          <div className="text-[13px] font-bold text-gray-900 mt-0.5">
                            {item.price.toLocaleString()} {t("bdt")}
                          </div>

                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center border border-primary rounded text-primary h-7">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-full flex items-center justify-center hover:bg-[#f9f5ff] transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <div className="w-8 text-center text-xs font-semibold border-x border-primary h-full flex items-center justify-center">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-full flex items-center justify-center hover:bg-[#f9f5ff] transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Link prefetch={false}
                    href="/"
                    className="text-xs font-bold text-primary hover:opacity-80 flex items-center gap-1"
                  >
                    <Plus size={14} /> {t("addMoreItems")}
                  </Link>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>{t("subTotal")}</span>
                  <span className="font-bold text-gray-900">
                    {totalPrice.toLocaleString()} {t("bdt")}
                  </span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>{t("vatTax")}</span>
                  <span className="font-bold text-gray-900">0 {t("bdt")}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-600">
                  <span>{t("deliveryCharge")} {shippingZoneName ? `(${shippingZoneName})` : ''}</span>
                  <span className="font-bold text-gray-900">
                    {totalPrice > 0 ? deliveryCharge.toLocaleString() : 0}{" "}
                    {t("bdt")}
                  </span>
                </div>
                <div className="pt-4 flex justify-between text-sm font-black text-gray-900">
                  <span>{t("total")}</span>
                  <span>
                    {grandTotal.toLocaleString()} {t("bdt")}
                  </span>
                </div>
              </div>

              {/* Add Note */}
              <div>
                <label className="text-[11px] font-bold text-gray-900 mb-2 block uppercase tracking-wide">
                  {t("addNote")}
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={t("deliveryInstructions")}
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary h-20 resize-none shadow-sm"
                ></textarea>
              </div>
            </div>

            {/* Confirm Order Button */}
            <div className="pt-8 mt-auto">
              <button
                onClick={handleCheckout}
                disabled={
                  !mounted || status === "processing" || cartItems.length === 0
                }
                className="w-full bg-primary hover:bg-primary text-white font-bold py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
              >
                {status === "processing" ? "Processing..." : t("confirmOrder")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
