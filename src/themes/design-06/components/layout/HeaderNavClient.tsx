'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ChevronRight } from 'lucide-react';
import { getStoreLogoUrl } from '@/utils/imageOptimizer';
import GlobalSearch06 from '../ui/GlobalSearch';

export default function HeaderNavClient06({
  info,
  tenantSlug,
  categories = [],
  theme,
}: {
  info?: any;
  tenantSlug: string;
  categories?: any[];
  theme?: any;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isBn = theme?.language === 'bn';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when mobile menu or mobile search is open
  useEffect(() => {
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen, mobileSearchOpen]);

  // Close mobile overlays on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Filter valid categories with valid names and slugs/ids (up to 3 in top desktop bar)
  const validCategories = React.useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories
      .filter((c: any) => c && typeof c.name === 'string' && c.name.trim() && (c.slug || c._id))
      .slice(0, 3);
  }, [categories]);

  const brandName = info?.name || tenantSlug || 'Store';

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Left: Mobile Hamburger Toggle & Circular Brand Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open mobile menu"
          className="lg:hidden p-2 -ml-1 text-gray-800 hover:text-black rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo - 1:1 Circular Logo with Store Name */}
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-2.5 sm:gap-3 shrink-0 group py-1"
        >
          {info?.logo ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-gray-200/90 shadow-2xs shrink-0 aspect-square flex items-center justify-center bg-gray-50" suppressHydrationWarning>
              <img
                src={getStoreLogoUrl(info.logo)}
                alt={brandName}
                className="w-full h-full object-cover rounded-full aspect-square"
                suppressHydrationWarning
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm aspect-square shrink-0 shadow-2xs">
              {(brandName || 'S').charAt(0).toUpperCase()}
            </div>
          )}

          <span
            style={theme?.storeTitleFont ? { fontFamily: `'${theme.storeTitleFont}', serif` } : undefined}
            className="store-title-font text-base sm:text-xl font-bold tracking-wider text-gray-900 uppercase group-hover:text-black transition-colors whitespace-nowrap"
          >
            {brandName}
          </span>
        </Link>
      </div>

      {/* Center Desktop Navigation Menu - Centered */}
      <nav className="hidden lg:flex items-center justify-center gap-5 xl:gap-8 flex-1 mx-4 text-center">
        <Link
          href="/"
          prefetch={false}
          className={`text-[13px] font-medium tracking-wide py-1 relative transition-colors ${
            isActive('/')
              ? 'text-black font-semibold after:w-full after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0'
              : 'text-gray-700 hover:text-black hover:after:w-full after:w-0 after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all'
          }`}
        >
          {isBn ? 'হোম' : 'Home'}
        </Link>

        <Link
          href="/products"
          prefetch={false}
          className={`text-[13px] font-medium tracking-wide py-1 relative transition-colors ${
            isActive('/products')
              ? 'text-black font-semibold after:w-full after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0'
              : 'text-gray-700 hover:text-black hover:after:w-full after:w-0 after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all'
          }`}
        >
          {isBn ? 'শপ' : 'Shop'}
        </Link>

        <Link
          href="/categories"
          prefetch={false}
          className={`text-[13px] font-medium tracking-wide py-1 relative transition-colors cursor-pointer ${
            isActive('/categories')
              ? 'text-black font-semibold after:w-full after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0'
              : 'text-gray-700 hover:text-black hover:after:w-full after:w-0 after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all'
          }`}
        >
          {isBn ? 'ক্যাটাগরি' : 'Categories'}
        </Link>

        {/* Valid Store Categories with properly encoded URLs */}
        {validCategories.map((cat: any) => {
          const catSlug = cat.slug || cat._id;
          const categoryUrl = `/category/${encodeURIComponent(catSlug)}`;
          const isCatActive = pathname === categoryUrl || pathname.includes(encodeURIComponent(catSlug));

          return (
            <Link
              key={cat._id}
              href={categoryUrl}
              prefetch={false}
              className={`text-[13px] font-medium tracking-wide py-1 relative transition-colors whitespace-nowrap ${
                isCatActive
                  ? 'text-black font-semibold after:w-full after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0'
                  : 'text-gray-700 hover:text-black hover:after:w-full after:w-0 after:h-[2px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Search Icon Toggle (Right next to cart icon) */}
      <div className="flex lg:hidden items-center">
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          aria-label="Open search"
          className="p-2 text-gray-800 hover:text-black rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer active:scale-95"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Clean Full-Screen Mobile Search Modal (Rendered directly in body via Portal) */}
      {mounted &&
        mobileSearchOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex flex-col justify-start p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-lg mx-auto flex flex-col max-h-[85vh] overflow-visible">
              {/* Modal Search Header with explicit Close X */}
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <GlobalSearch06
                    tenantSlug={tenantSlug}
                    theme={theme}
                    autoFocus={true}
                    onSelect={() => setMobileSearchOpen(false)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Backdrop Click Area to dismiss */}
            <div className="flex-1 w-full" onClick={() => setMobileSearchOpen(false)} />
          </div>,
          document.body
        )}

      {/* Mobile Slide-Out Drawer Menu (Rendered directly in body via Portal - 100% full screen & visible) */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex lg:hidden">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Content - Full height on all devices */}
            <div className="relative w-[85%] max-w-sm bg-white h-full min-h-[100dvh] shadow-2xl flex flex-col justify-between z-10 overflow-y-auto">
              <div>
                {/* Drawer Header with 1:1 Circular Logo */}
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {info?.logo ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 aspect-square shrink-0 flex items-center justify-center bg-gray-50" suppressHydrationWarning>
                        <img
                          src={getStoreLogoUrl(info.logo)}
                          alt={brandName}
                          className="w-full h-full object-cover rounded-full aspect-square"
                          suppressHydrationWarning
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs aspect-square shrink-0">
                        {(brandName || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      style={theme?.storeTitleFont ? { fontFamily: `'${theme.storeTitleFont}', serif` } : undefined}
                      className="store-title-font text-base font-bold tracking-wider uppercase text-gray-900 truncate"
                    >
                      {brandName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Quick Search */}
                <div className="p-4 border-b border-gray-100">
                  <GlobalSearch06
                    tenantSlug={tenantSlug}
                    theme={theme}
                    onSelect={() => setMobileMenuOpen(false)}
                  />
                </div>

                {/* Drawer Navigation Links */}
                <div className="p-4 space-y-1">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname === '/' ? 'bg-gray-100 text-black' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{isBn ? 'হোম' : 'Home'}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname.startsWith('/products') ? 'bg-gray-100 text-black' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{isBn ? 'সব পণ্য' : 'Shop Collection'}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname.startsWith('/categories') ? 'bg-gray-100 text-black' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{isBn ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-colors ${
                      pathname.startsWith('/track-order') ? 'bg-gray-100 text-black' : 'text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{isBn ? 'অর্ডার ট্র্যাক করুন' : 'Track Your Order'}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                </div>

                {/* Categories list in Drawer */}
                {categories.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 block mb-2">
                      {isBn ? 'ক্যাটাগরি সমূহ' : 'Shop by Category'}
                    </span>
                    <div className="space-y-1">
                      {categories.slice(0, 8).map((c: any) => {
                        const cSlug = c.slug || c._id;
                        const cUrl = `/category/${encodeURIComponent(cSlug)}`;
                        return (
                          <Link
                            key={c._id}
                            href={cUrl}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                          >
                            <span>{c.name}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Contact / Info */}
              <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/50">
                {info?.contactPhone && (
                  <p className="text-xs text-gray-600 mb-1">
                    📞 {isBn ? 'হটলাইন:' : 'Hotline:'}{' '}
                    <a href={`tel:${info.contactPhone}`} className="font-semibold text-gray-900 hover:underline">
                      {info.contactPhone}
                    </a>
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  {isBn ? 'সারা দেশে দ্রুত ডেলিভারি' : 'Fast Delivery Across Bangladesh'}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
