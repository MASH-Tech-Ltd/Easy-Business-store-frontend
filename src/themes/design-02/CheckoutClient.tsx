"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Minus, Plus, Trash2, Check } from "lucide-react";
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

export default function Design02CheckoutClient({ theme,
  storeInfo,
}: {
  storeInfo?: any; theme?: any;
}) {


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
        if (info.district) setDistrict(info.district);
        if (info.upazila) setUpazila(info.upazila);
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

  // Static Location Derived Data
  const divisionsList = bdLocations.map((d) => d.division);
  const districtsList =
    bdLocations.find((d) => d.division === division)?.districts || [];
  const upazilasList =
    districtsList.find((d) => d.district === district)?.upazilas || [];

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
      } catch (err) {}

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
      <main className="max-w-7xl mx-auto px-8 py-32 flex-1 w-full flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-4">
          {t("orderConfirmed") || "Order Confirmed"}
        </h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          {t("thankYouPurchase") || "Thank you for your purchase."}
        </p>

        {orderId && (
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider text-[10px] font-bold">Order ID</p>
            <p className="font-mono text-lg text-gray-900">#{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          {orderId && (
            <Link
              href={`/track-order?id=${orderId}`}
              className="px-8 py-4 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto"
            >
              Track Order
            </Link>
          )}
          <Link
            href="/"
            className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            {t("continueShopping") || "Continue Shopping"}
          </Link>
        </div>
      </main>
    );
  }

    return (
      <main className="max-w-7xl mx-auto px-8 py-20 flex-1 w-full">
        <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-12">
          {t("checkout") || "Checkout"}
        </h2>
  
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Form Section */}
          <div className="flex-1 space-y-12">
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-6 uppercase tracking-wider">
                {t("contact") || "Contact"}
              </h3>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t("phoneNumber") || "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone)
                        setFieldErrors((prev) => ({ ...prev, phone: [] }));
                    }}
                    placeholder="e.g. 01700000000"
                    className={`w-full bg-gray-50 border ${fieldErrors.phone?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors`}
                  />
                  {fieldErrors.phone?.[0] && (
                    <p className="text-xs text-red-500 mt-2">
                      {fieldErrors.phone[0]}
                    </p>
                  )}
                </div>
              </div>
            </section>
  
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-6 uppercase tracking-wider">
                {t("personalInfo") || "Personal Info"}
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t("fullName") || "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName)
                        setFieldErrors((prev) => ({ ...prev, fullName: [] }));
                    }}
                    placeholder="Your Full Name"
                    className={`w-full bg-gray-50 border ${fieldErrors.fullName?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors`}
                  />
                  {fieldErrors.fullName?.[0] && (
                    <p className="text-xs text-red-500 mt-2">
                      {fieldErrors.fullName[0]}
                    </p>
                  )}
                </div>
  
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t("address") || "Address"}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (fieldErrors.address)
                        setFieldErrors((prev) => ({ ...prev, address: [] }));
                    }}
                    placeholder="Street Address, Area"
                    className={`w-full bg-gray-50 border ${fieldErrors.address?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors`}
                  />
                  {fieldErrors.address?.[0] && (
                    <p className="text-xs text-red-500 mt-2">
                      {fieldErrors.address[0]}
                    </p>
                  )}
                </div>
  
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {t("selectDivision") || "Division"}
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
                    className={`w-full bg-gray-50 border ${fieldErrors.division?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors appearance-none`}
                  >
                    <option value="" disabled>
                      {t("selectDivision") || "Select Division"}
                    </option>
                    {divisionsList.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.division?.[0] && (
                    <p className="text-xs text-red-500 mt-2">
                      {fieldErrors.division[0]}
                    </p>
                  )}
                </div>
  
                {division && (
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {t("selectDistrict") || "Select District"}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setUpazila("");
                        if (fieldErrors.district)
                          setFieldErrors((prev) => ({ ...prev, district: [] }));
                      }}
                      className={`w-full bg-gray-50 border ${fieldErrors.district?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors appearance-none`}
                    >
                      <option value="" disabled>{t("selectDistrict") || "Select District"}</option>
                      {districtsList.map((dist) => (
                        <option key={dist.district} value={dist.district}>
                          {dist.district}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.district?.[0] && (
                      <p className="text-xs text-red-500 mt-2">
                        {fieldErrors.district[0]}
                      </p>
                    )}
                  </div>
                )}
  
                {district && (
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {t("selectSubdistrict") || "Select Subdistrict / Thana"}
                    </label>
                    <select
                      value={upazila}
                      onChange={(e) => {
                        setUpazila(e.target.value);
                        if (fieldErrors.upazila)
                          setFieldErrors((prev) => ({ ...prev, upazila: [] }));
                      }}
                      className={`w-full bg-gray-50 border ${fieldErrors.upazila?.length ? "border-red-500" : "border-transparent focus:border-gray-300"} rounded p-4 text-sm focus:outline-none transition-colors appearance-none`}
                    >
                      <option value="" disabled>{t("selectSubdistrict") || "Select Subdistrict / Thana"}</option>
                      {upazilasList.map((upz) => (
                        <option key={upz} value={upz}>
                          {upz}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.upazila?.[0] && (
                      <p className="text-xs text-red-500 mt-2">
                        {fieldErrors.upazila[0]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
  
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-6 uppercase tracking-wider">
                {t("paymentOptions") || "Payment"}
              </h3>
              <div className="border border-gray-900 bg-white rounded p-6 flex items-center justify-between shadow-sm cursor-pointer">
                <span className="font-medium text-gray-900">
                  {t("cashOnDelivery") || "Cash on Delivery"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">
                    {shippingZoneName ? `${shippingZoneName} ` : ''}+{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0} {theme?.currencySymbol || '৳'}
                  </span>
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </section>
          </div>
  
          {/* Order Summary Section */}
          <div className="lg:w-[420px] shrink-0">
            <div className="bg-gray-50 p-8 rounded-xl sticky top-28">
              <h3 className="text-lg font-medium text-gray-900 mb-8 uppercase tracking-wider">
                {t("orderSummary") || "Order Summary"}
              </h3>
  
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cartItems.length === 0 ? (
                  <div className="text-gray-500 text-sm">
                    {t("yourCartIsEmpty") || "Your Cart is Empty"}
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                      <div className="w-16 h-16 bg-white rounded overflow-hidden shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover mix-blend-multiply"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="text-[10px] text-gray-400">
                              No Img
                            </span>
                          </div>
                        )}
                      </div>
  
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900 pt-1">
                        {theme?.currencySymbol || '৳'}{' '}{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
  
              <div className="space-y-4 pt-6 border-t border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{t("subTotal") || "Subtotal"}</span>
                  <span className="font-medium text-gray-900">
                    {theme?.currencySymbol || '৳'}{' '}{totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t("deliveryCharge") || "Delivery"} {shippingZoneName ? `(${shippingZoneName})` : ''}</span>
                  <span className="font-medium text-gray-900">
                    {theme?.currencySymbol || '৳'}{' '}{totalPrice > 0 ? deliveryCharge.toLocaleString() : 0}
                  </span>
                </div>
                <div className="pt-4 flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200">
                  <span>{t("total") || "Total"}</span>
                  <span>{theme?.currencySymbol || '৳'}{' '}{grandTotal.toLocaleString()}</span>
                </div>
              </div>
  
              <div className="mt-8">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  {t("addNote") || "Note"}
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={t("deliveryInstructions") || "Optional delivery instructions"}
                  className="w-full bg-white border border-transparent focus:border-gray-300 rounded p-4 text-sm focus:outline-none transition-colors h-24 resize-none"
                ></textarea>
              </div>
  
              <button
                onClick={handleCheckout}
                disabled={
                  !mounted || status === "processing" || cartItems.length === 0
                }
                className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {status === "processing"
                  ? (t("processing") || "Processing...")
                  : (t("confirmOrder") || "Confirm Order")}
              </button>
          </div>
        </div>
      </div>
    </main>
  );
}
