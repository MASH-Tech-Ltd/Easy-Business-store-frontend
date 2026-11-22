'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon06() {
  const { totalItems } = useCart();

  return (
    <Link
      prefetch={false}
      href="/cart"
      aria-label="Shopping Cart"
      className="text-gray-800 hover:text-black transition-colors p-2 flex items-center justify-center relative group cursor-pointer"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-hover:text-black transition-colors" strokeWidth={1.75} />
        <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-black text-white text-[9px] font-bold rounded-full ring-2 ring-white shadow-xs leading-none">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      </div>
    </Link>
  );
}
