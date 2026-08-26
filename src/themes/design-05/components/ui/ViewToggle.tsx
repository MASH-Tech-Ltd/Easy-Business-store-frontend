'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function ViewToggle05() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isListView = searchParams.get('view') === 'list';

  const toggleView = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'list') {
      params.set('view', 'list');
    } else {
      params.delete('view');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => toggleView('grid')}
        className={`p-2 rounded-full transition-all ${!isListView ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
        aria-label="Grid View"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </button>
      <button 
        onClick={() => toggleView('list')}
        className={`p-2 rounded-full transition-all ${isListView ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-gray-50'}`}
        aria-label="List View"
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
      </button>
    </div>
  );
}
