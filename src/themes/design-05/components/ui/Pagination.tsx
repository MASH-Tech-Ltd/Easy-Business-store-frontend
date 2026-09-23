'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Pagination05({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pages = [];
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  for (let i = startPage; i <= endPage; i++) pages.push(i);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-16 pt-8">
      {currentPage > 1 ? (
        <Link prefetch={false} href={getPageUrl(currentPage - 1)} className="text-sm font-medium text-gray-500 hover:text-black transition-colors uppercase tracking-widest flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> Prev
        </Link>
      ) : (
        <span className="text-sm font-medium text-gray-300 uppercase tracking-widest flex items-center gap-1 cursor-not-allowed">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg> Prev
        </span>
      )}

      <div className="flex items-center gap-2 px-6">
        {pages[0] > 1 && (
          <>
            <Link prefetch={false} href={getPageUrl(1)} className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">1</Link>
            {pages[0] > 2 && <span className="text-gray-300">...</span>}
          </>
        )}

        {pages.map(page => (
          <Link prefetch={false} key={page} href={getPageUrl(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all ${
              currentPage === page ? 'bg-black text-white font-bold' : 'text-gray-500 hover:text-black hover:bg-gray-50 font-medium'
            }`}>
            {page}
          </Link>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-300">...</span>}
            <Link prefetch={false} href={getPageUrl(totalPages)} className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">{totalPages}</Link>
          </>
        )}
      </div>

      {currentPage < totalPages ? (
        <Link prefetch={false} href={getPageUrl(currentPage + 1)} className="text-sm font-medium text-gray-500 hover:text-black transition-colors uppercase tracking-widest flex items-center gap-1">
          Next <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </Link>
      ) : (
        <span className="text-sm font-medium text-gray-300 uppercase tracking-widest flex items-center gap-1 cursor-not-allowed">
          Next <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </span>
      )}
    </div>
  );
}
