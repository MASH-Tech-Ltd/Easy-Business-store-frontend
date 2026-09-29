import React from 'react';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 bg-gray-200 rounded w-48 mb-6" />

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          {/* Main Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl w-full" />
            <div className="grid grid-cols-4 gap-3">
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="aspect-square bg-gray-200 rounded-xl" />
              <div className="aspect-square bg-gray-200 rounded-xl" />
            </div>
          </div>

          {/* Right Info Skeleton */}
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3" />

            <div className="space-y-2 py-4 border-y border-gray-100">
              <div className="h-10 bg-gray-200 rounded-lg w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>

            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="h-14 bg-gray-200 rounded-xl flex-1" />
              <div className="h-14 bg-gray-200 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
