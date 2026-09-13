'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function GlobalSearch({ tenantSlug }: { tenantSlug: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) { setResults([]); setIsOpen(false); return; }
      setIsLoading(true); setIsOpen(true);
      try {
        const res = await fetch(`/api/search?tenantSlug=${tenantSlug}&query=${encodeURIComponent(query)}&limit=10`);
        const json = await res.json();
        if (json.data?.data) setResults(json.data.data);
      } catch { } finally { setIsLoading(false); }
    };
    const t = setTimeout(searchProducts, 300);
    return () => clearTimeout(t);
  }, [query, tenantSlug]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Search products..."
          className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
        />
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
            ) : results.length > 0 ? (
              <div className="flex flex-col divide-y divide-gray-50">
                {results.map((product) => (
                  <Link key={product._id} href={`/product/${product.slug}`} onClick={() => { setIsOpen(false); setQuery(''); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                      <img src={product.images?.[0]?.secure_url || 'https://placehold.co/100'} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{product.title}</div>
                      <div className="text-xs text-gray-400">{product.brand || ''}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{theme?.currencySymbol || '৳'}{product.discountedPrice?.toLocaleString()}</div>
                  </Link>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-sm text-gray-400">No products found for "{query}"</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
