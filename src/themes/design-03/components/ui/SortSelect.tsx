'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SortSelect03() {
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
    <div className="flex items-center gap-2">
      <label htmlFor="sort-03" className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort:</label>
      <select
        id="sort-03"
        value={currentSort}
        onChange={handleSortChange}
        className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-sm font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/20 outline-none cursor-pointer"
      >
        <option value="newest">Newest</option>
        <option value="brand">By Brand</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
        <option value="discount_desc">Highest Discount</option>
      </select>
    </div>
  );
}
