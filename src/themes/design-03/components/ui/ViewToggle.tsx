'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle03() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get('view') || 'grid';

  const handleViewChange = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 border border-white/10 rounded-lg p-1 bg-white/5">
      <button
        onClick={() => handleViewChange('grid')}
        className={`p-1.5 rounded transition-colors ${currentView === 'grid' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        aria-label="Grid View"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleViewChange('list')}
        className={`p-1.5 rounded transition-colors ${currentView === 'list' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        aria-label="List View"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
