'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SortSelect05() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="sort05" className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sort</label>
      <div className="relative">
        <select id="sort05" value={currentSort} onChange={handleSortChange}
          className="appearance-none border-b border-gray-200 bg-transparent py-1.5 pl-0 pr-6 text-[15px] font-medium text-gray-900 focus:outline-none focus:border-black cursor-pointer transition-colors">
          <option value="customized">Featured</option>
          <option value="newest">Newest Collection</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="discount_desc">Best Discount</option>
        </select>
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </div>
  );
}
