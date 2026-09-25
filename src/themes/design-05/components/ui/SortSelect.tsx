'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function SortSelect05() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get('sort') || 'newest';
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options = [
    { value: 'customized', label: 'Featured' },
    { value: 'newest', label: 'Newest Collection' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'discount_desc', label: 'Best Discount' }
  ];

  const currentLabel = options.find(o => o.value === currentSort)?.label || 'Sort';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', val);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort</span>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between gap-4 border border-gray-200 bg-white rounded-full px-4 py-2 w-[170px] text-sm font-medium text-gray-900 hover:border-gray-300 hover:shadow-sm transition-all"
        >
          <span className="truncate">{currentLabel}</span>
          <svg className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/[0.03] z-50 overflow-hidden py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  currentSort === opt.value ? 'bg-gray-50 text-black font-semibold' : 'text-gray-500 font-medium hover:bg-gray-50 hover:text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
