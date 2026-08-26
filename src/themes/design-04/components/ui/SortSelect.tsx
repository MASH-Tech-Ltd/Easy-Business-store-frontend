'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function SortSelect04() {
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
      <label htmlFor="sort04" className="text-sm font-medium text-gray-500 whitespace-nowrap">Sort:</label>
      <select id="sort04" value={currentSort} onChange={handleSortChange}
        className="border border-gray-200 rounded-xl py-2 px-3 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer">
        <option value="customized">Featured</option>
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="discount_desc">Best Discount</option>
        <option value="brand">By Brand</option>
      </select>
    </div>
  );
}
