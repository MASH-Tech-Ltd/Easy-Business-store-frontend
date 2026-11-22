'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle06({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleViewChange = (newView: 'grid' | 'list', e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.currentTarget?.blur();
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', newView);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200/60 select-none">
      <button
        type="button"
        onClick={(e) => handleViewChange('grid', e)}
        aria-label="Grid view"
        className={`p-1.5 rounded-full transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-0 ${
          view === 'grid' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={(e) => handleViewChange('list', e)}
        aria-label="List view"
        className={`p-1.5 rounded-full transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-0 ${
          view === 'list' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'
        }`}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
