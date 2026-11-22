'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export default function SortSelect06({ theme }: { theme?: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isBn = theme?.language === 'bn';
  const rawSort = searchParams.get('sort') || 'newest';
  const currentSort = rawSort === 'price-asc' ? 'price_asc' : rawSort === 'price-desc' ? 'price_desc' : rawSort;

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', newSort);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          aria-label="Sort products"
          className="appearance-none bg-white border border-gray-200 text-gray-800 text-xs sm:text-sm font-medium rounded-full pl-8 pr-8 py-2 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 cursor-pointer transition-colors shadow-xs"
        >
          <option value="newest">{isBn ? 'লেটেস্ট কালেকশন' : 'Latest Arrivals'}</option>
          <option value="price_asc">{isBn ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
          <option value="price_desc">{isBn ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
          <option value="discount_desc">{isBn ? 'সর্বোচ্চ ছাড়' : 'Highest Discount'}</option>
        </select>
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
