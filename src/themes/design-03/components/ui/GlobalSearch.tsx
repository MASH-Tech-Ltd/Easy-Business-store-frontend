'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function GlobalSearch03({ tenantSlug }: { tenantSlug: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
        const res = await fetch(`/api/search?tenantSlug=${tenantSlug}&query=${encodeURIComponent(query)}&limit=10`);
        const json = await res.json();
        if (json.data && json.data.data) {
          setResults(json.data.data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, tenantSlug]);

  return (
    <div ref={wrapperRef} className="relative flex-1 w-full font-mono">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="SEARCH.DB..."
          className="w-full h-10 pl-10 pr-4 bg-black border border-white/20 text-white text-xs uppercase tracking-widest focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-600"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 opacity-70" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/20 shadow-2xl z-50">
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-cyan-400 uppercase tracking-widest animate-pulse">Querying DB...</div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                {results.map((product) => (
                  <Link
                    key={product._id}
                    href={`/product/${product.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 border-b border-white/10 last:border-0 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-[#111] border border-white/10 flex-shrink-0 flex items-center justify-center p-1 group-hover:border-cyan-400 transition-colors">
                      <img 
                        src={product.images?.[0]?.secure_url || 'https://placehold.co/100'} 
                        alt={product.title}
                        className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white uppercase truncate tracking-wide">{product.title}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest">ID: {product._id?.substring(0,8) || 'UNK'}</div>
                    </div>
                    <div className="text-xs font-black text-cyan-400">
                      {theme?.currencySymbol || '৳'}{' '}{product.discountedPrice?.toLocaleString()}
                    </div>
                  </Link>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-xs text-red-500 uppercase tracking-widest">404: No Signal Found</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
