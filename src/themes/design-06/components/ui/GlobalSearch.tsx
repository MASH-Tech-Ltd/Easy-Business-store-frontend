'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { getSearchThumbnailUrl } from '@/utils/imageOptimizer';

export default function GlobalSearch06({
  tenantSlug,
  theme,
  autoFocus = false,
  onSelect,
}: {
  tenantSlug: string;
  theme?: any;
  autoFocus?: boolean;
  onSelect?: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBn = theme?.language === 'bn';

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

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
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}&limit=8`);
        const json = await res.json();
        if (json.data?.data) setResults(json.data.data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    const t = setTimeout(searchProducts, 350);
    return () => clearTimeout(t);
  }, [query, tenantSlug]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder={isBn ? 'পণ্য খুঁজুন...' : 'Search products, categories...'}
          className="w-full h-10 pl-10 pr-9 bg-gray-50/90 hover:bg-gray-100/90 border border-gray-200/90 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:border-black focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
        />
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors pointer-events-none" />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
              <span>{isBn ? 'পণ্য খোঁজা হচ্ছে...' : 'Searching products...'}</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
              {results.map((product) => {
                const img = product.images?.[0]?.secure_url || product.image?.secure_url || product.image;
                const price = product.discountedPrice || product.originalPrice || product.price || 0;
                const slug = product.slug || product._id;
                return (
                  <Link
                    key={product._id}
                    href={`/product/${slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      onSelect?.();
                    }}
                    className="flex items-center gap-3.5 p-3 hover:bg-gray-50/80 transition-colors group"
                  >
                    <div className="w-12 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                      {img ? (
                        <img src={getSearchThumbnailUrl(img)} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-300 font-bold uppercase">No Pic</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-black truncate">{product.title || product.name}</p>
                      <p className="text-xs font-semibold text-gray-900 mt-0.5">
                        {theme?.currencySymbol || '৳'}{' '}{price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {isBn ? `"${query}" এর কোনো পণ্য পাওয়া যায়নি` : `No products found matching "${query}"`}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
