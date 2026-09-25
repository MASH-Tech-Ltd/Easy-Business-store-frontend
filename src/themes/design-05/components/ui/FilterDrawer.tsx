"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import FilterSidebar from "./FilterSidebar";

interface FilterDrawerProps {
  categoryId: string;
  availableBrands?: string[];
  theme?: any;
}

export default function FilterDrawer({
  categoryId,
  availableBrands = [],
  theme,
}: FilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleReset = () => {
    const basePath = categoryId ? `/category/${categoryId}` : pathname;
    router.push(basePath);
  };

  return (
    <>
      {/* Only show on mobile — hidden on lg+ */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white border border-l-0 border-gray-200 shadow-md p-3 rounded-r-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all flex items-center justify-center group"
        aria-label="Open Filters"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:scale-110 transition-transform"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-4 bottom-4 left-4 w-[300px] h-[calc(100vh-32px)] bg-white rounded-[2rem] z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-[120%]"
        } flex flex-col overflow-hidden`}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <h2 className="text-base font-bold tracking-tight text-gray-900">Filters</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto custom-scrollbar">
          <FilterSidebar
            categoryId={categoryId}
            availableBrands={availableBrands}
            theme={theme}
          />
        </div>
      </div>
    </>
  );
}
