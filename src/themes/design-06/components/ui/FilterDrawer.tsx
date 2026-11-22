'use client';

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import FilterSidebar06 from './FilterSidebar';

export default function FilterDrawer06({
  categoryId,
  availableBrands = [],
  theme,
}: {
  categoryId?: string;
  availableBrands?: string[];
  theme?: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-xs sm:text-sm font-semibold text-gray-800 hover:border-black transition-colors bg-white shadow-xs"
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterSidebar06
                categoryId={categoryId}
                availableBrands={availableBrands}
                theme={theme}
                onApply={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
