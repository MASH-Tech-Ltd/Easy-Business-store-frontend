'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination03({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const limit = searchParams.get('limit') || '20';

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto pt-8 border-t border-white/5">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>Show</span>
        <select value={limit} onChange={handleLimitChange} className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20">
          <option value="12">12</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span>per page</span>
      </div>
      <div className="flex items-center gap-1">
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)} className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">‹</Link>
        ) : (
          <span className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-700 cursor-not-allowed">‹</span>
        )}
        {pageNumbers.map(page => (
          <Link key={page} href={getPageUrl(page)} className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${currentPage === page ? 'bg-white text-black font-bold' : 'border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {page}
          </Link>
        ))}
        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)} className="w-8 h-8 flex items-center justify-center rounded border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">›</Link>
        ) : (
          <span className="w-8 h-8 flex items-center justify-center rounded border border-white/5 text-gray-700 cursor-not-allowed">›</span>
        )}
      </div>
    </div>
  );
}
