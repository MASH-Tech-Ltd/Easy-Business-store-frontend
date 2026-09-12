'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon02() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative text-gray-900 hover:text-gray-500 transition-colors p-2 flex items-center">
      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
