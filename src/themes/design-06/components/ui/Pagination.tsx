'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination06({
  currentPage = 1,
  totalPages = 1,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  if (totalPages <= 1) return null;

  const navigateToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-10 pb-6">
      <button
        type="button"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => navigateToPage(Number(p))}
            className={`w-9 h-9 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              p === currentPage
                ? 'bg-black text-white shadow-sm'
                : 'border border-gray-200 text-gray-700 hover:border-black hover:text-black'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
