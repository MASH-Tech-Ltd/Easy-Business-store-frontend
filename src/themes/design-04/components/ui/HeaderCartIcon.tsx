'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon() {
  const { totalItems } = useCart();
  return (
    <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors p-2">
      <ShoppingCart className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center w-5 h-5 bg-gray-900 text-white text-[10px] font-bold rounded-full border-2 border-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
