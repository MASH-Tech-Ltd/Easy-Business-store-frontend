'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon05() {
  const { totalItems } = useCart();
  return (
    <Link 
      prefetch={false} 
      href="/cart" 
      aria-label="Shopping Cart"
      className="text-gray-700 hover:text-black transition-colors p-2 flex items-center justify-center group"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" strokeWidth={1.75} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[12px] h-[12px] px-0.5 bg-black text-white text-[8px] font-bold rounded-full ring-1.5 ring-white shadow-xs leading-none">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}
