'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/utils/translations';

export default function GlobalSearch({ tenantSlug, language = 'en', theme }: { tenantSlug: string, language?: string, theme?: any }) {
  const t = (key: any) => getTranslation(language, key);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) { setResults([]); setIsOpen(false); return; }
      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?search=${encodeURIComponent(query)}&limit=10`);
        const json = await res.json();
        if (json.data?.data) setResults(json.data.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [query, tenantSlug]);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder={t("searchForProducts") || "Search for products..."}
          className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    onClick={() => { setIsOpen(false); setQuery(''); }}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded flex-shrink-0 overflow-hidden">
                      <img src={product.images?.[0]?.secure_url || 'https://placehold.co/100'} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{product.title}</div>
                      <div className="text-xs text-gray-500">{product.brand || 'Generic'}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{theme?.currencySymbol || '৳'}{' '}{product.discountedPrice?.toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-sm text-gray-500">No products found for "{query}"</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
