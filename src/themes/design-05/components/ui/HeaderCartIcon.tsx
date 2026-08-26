'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon05() {
  const { totalItems } = useCart();
  return (
    <Link href="/cart" className="relative text-gray-700 hover:text-black transition-colors p-2 flex items-center justify-center">
      <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 -mt-0.5 -mr-0.5 flex items-center justify-center w-[18px] h-[18px] bg-black text-white text-[10px] font-medium rounded-full ring-2 ring-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
