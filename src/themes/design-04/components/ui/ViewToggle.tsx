'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ViewToggle04() {
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
    <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-white">
      <button onClick={() => handleViewChange('grid')} className={`p-1.5 rounded-lg transition-all ${currentView === 'grid' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button onClick={() => handleViewChange('list')} className={`p-1.5 rounded-lg transition-all ${currentView === 'list' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
