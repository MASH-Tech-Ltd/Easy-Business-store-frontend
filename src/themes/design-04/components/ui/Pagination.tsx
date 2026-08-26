'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Pagination04({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
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
    <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100">
      {currentPage > 1 ? (
        <Link href={getPageUrl(currentPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors">
          ‹
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-300 cursor-not-allowed">‹</span>
      )}

      {pages[0] > 1 && (
        <>
          <Link href={getPageUrl(1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-900 transition-colors font-medium">1</Link>
          {pages[0] > 2 && <span className="text-gray-400">...</span>}
        </>
      )}

      {pages.map(page => (
        <Link key={page} href={getPageUrl(page)}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
            currentPage === page ? 'bg-gray-900 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'
          }`}>
          {page}
        </Link>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-400">...</span>}
          <Link href={getPageUrl(totalPages)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:border-gray-900 transition-colors font-medium">{totalPages}</Link>
        </>
      )}

      {currentPage < totalPages ? (
        <Link href={getPageUrl(currentPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors">
          ›
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-100 text-gray-300 cursor-not-allowed">›</span>
      )}
    </div>
  );
}
