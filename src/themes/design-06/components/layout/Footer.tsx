import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, Clock } from 'lucide-react';
import { getTranslation } from '@/utils/translations';
import { cleanCopyright, cleanMetaDescription } from '@/utils/cleanText';
import PoweredByBadge from '@/components/PoweredByBadge';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Tiktok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a8 8 0 0 1-8-8H7v12a2 2 0 1 1-2-2 2 2 0 0 1 2 .5v-3.2a5 5 0 1 0 5 8.7V12z" />
  </svg>
);

export default function Footer06({
  storeInfo,
  theme,
}: {
  storeInfo?: any;
  theme?: any;
}) {
  const language = theme?.language || 'bn';
  const t = (key: any) => getTranslation(language, key);

  const year = new Date().getFullYear();
  const footer = theme?.footer || {};
  const socialLinks = footer.socialLinks || {};
  const contactInfo = footer.contactInfo || {};
  const storeName = storeInfo?.name || 'Online Store';
  // Copyright credit must always remain in English per design requirement
  const copyrightText = `© ${year} ${storeName}. All rights reserved.`;

  const isBn = language === 'bn';

  return (
    <footer className="bg-white border-t border-gray-100 text-gray-900 mt-auto">
      {/* 1. Trust & Value Proposition Strip (Fully responsive & beautiful on mobile) */}
      <div className="border-b border-gray-100 bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {/* Delivery */}
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3.5 p-3 sm:p-2 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-gray-100 shadow-xs sm:shadow-none w-full max-w-[280px] mx-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 sm:bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-gray-900">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-sm font-bold text-gray-900 truncate">
                  {isBn ? 'দ্রুত ডেলিভারি' : 'Fast Express Delivery'}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {isBn ? 'সারা দেশে দ্রুত ডেলিভারি' : 'Doorstep dispatch across BD'}
                </p>
              </div>
            </div>

            {/* Authentic */}
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3.5 p-3 sm:p-2 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-gray-100 shadow-xs sm:shadow-none w-full max-w-[280px] mx-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 sm:bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-gray-900">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-sm font-bold text-gray-900 truncate">
                  {isBn ? '১০০% আসল পণ্য' : '100% Authentic Quality'}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {isBn ? 'গুণগত মান নিশ্চিত' : 'Verified authentic product'}
                </p>
              </div>
            </div>

            {/* Returns */}
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3.5 p-3 sm:p-2 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-gray-100 shadow-xs sm:shadow-none w-full max-w-[280px] mx-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 sm:bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-gray-900">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-sm font-bold text-gray-900 truncate">
                  {isBn ? 'সহজ রিটার্ন সুবিধা' : 'Easy Return & Exchange'}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {isBn ? 'সহজ এক্সচেঞ্জ পলিসি' : 'Hassle-free return policy'}
                </p>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3.5 p-3 sm:p-2 rounded-2xl bg-white sm:bg-transparent border sm:border-0 border-gray-100 shadow-xs sm:shadow-none w-full max-w-[280px] mx-auto">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-50 sm:bg-white shadow-xs border border-gray-100 flex items-center justify-center shrink-0 text-gray-900">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] sm:text-sm font-bold text-gray-900 truncate">
                  {isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                </h4>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {isBn ? 'পণ্য দেখে মূল্য পরিশোধ' : 'Pay after receiving parcel'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-5 lg:col-span-4 pr-0 lg:pr-6">
            <Link href="/" prefetch={false} className="inline-flex items-center gap-3 mb-3">
              {storeInfo?.logo ? (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200 aspect-square shrink-0 flex items-center justify-center bg-gray-50 shadow-2xs" suppressHydrationWarning>
                  <img
                    src={getStoreLogoUrl(storeInfo.logo)}
                    alt={storeName}
                    className="w-full h-full object-cover rounded-full aspect-square"
                    suppressHydrationWarning
                  />
                </div>
              ) : null}
              <span
                style={theme?.storeTitleFont ? { fontFamily: `'${theme.storeTitleFont}', serif` } : undefined}
                className="store-title-font text-xl sm:text-2xl font-bold tracking-widest uppercase text-gray-900"
              >
                {storeName}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-sm mb-5">
              {storeInfo?.description
                ? cleanMetaDescription(storeInfo.description)
                : (isBn
                    ? 'আপনার বিশ্বস্ত অনলাইন শপিং গন্তব্য। আসল পণ্য ও দ্রুততম ডেলিভারি নিশ্চিত করাই আমাদের লক্ষ্য।'
                    : 'Your trusted destination for premium quality products and seamless shopping experience.')}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                >
                  <Facebook />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                >
                  <Instagram />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                >
                  <Youtube />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center text-gray-700 transition-colors"
                >
                  <Tiktok />
                </a>
              )}
            </div>
          </div>

          {/* Links Grid: On mobile, 2 columns side by side! */}
          <div className="md:col-span-7 lg:col-span-5 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b border-gray-100">
                {isBn ? 'প্রয়োজনীয় লিংক' : 'Quick Links'}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'হোম' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link href="/products" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'সব পণ্য' : 'All Products'}
                  </Link>
                </li>
                <li>
                  <Link href="/categories" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'ক্যাটাগরি' : 'Categories'}
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" prefetch={false} className="hover:text-black transition-colors block py-0.5 cursor-pointer">
                    {isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Policies & Legal Information */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b border-gray-100">
                {isBn ? 'পলিসি ও তথ্য' : 'Policies & Info'}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="/policies/about-us" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'আমাদের সম্পর্কে' : 'About Us'}
                  </Link>
                </li>
                <li>
                  <Link href="/policies/privacy-policy" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'প্রাইভেসি পলিসি' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link href="/policies/terms-and-conditions" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'শর্তাবলী' : 'Terms & Conditions'}
                  </Link>
                </li>
                <li>
                  <Link href="/policies/return-policy" prefetch={false} className="hover:text-black transition-colors block py-0.5">
                    {isBn ? 'রিটার্ন ও রিফান্ড পলিসি' : 'Return & Refund Policy'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-12 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3 pb-1 border-b border-gray-100">
              {isBn ? 'যোগাযোগ' : 'Contact Us'}
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
              {(contactInfo.phone || storeInfo?.contactPhone) && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:${contactInfo.phone || storeInfo?.contactPhone}`} className="hover:text-black transition-colors">
                    {contactInfo.phone || storeInfo?.contactPhone}
                  </a>
                </div>
              )}
              {(contactInfo.email || storeInfo?.contactEmail || storeInfo?.email) && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`mailto:${contactInfo.email || storeInfo?.contactEmail || storeInfo?.email}`} className="truncate hover:text-black transition-colors">
                    {contactInfo.email || storeInfo?.contactEmail || storeInfo?.email}
                  </a>
                </div>
              )}
              {(contactInfo.address || storeInfo?.contactAddress || storeInfo?.address) && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{contactInfo.address || storeInfo?.contactAddress || storeInfo?.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Bottom Strip (with extra bottom padding for mobile safe area & floating widgets) */}
        <div className="pt-6 sm:pt-8 pb-16 sm:pb-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
          <p>{copyrightText}</p>
          <div className="flex items-center justify-center">
            <PoweredByBadge />
          </div>
        </div>
      </div>
    </footer>
  );
}
