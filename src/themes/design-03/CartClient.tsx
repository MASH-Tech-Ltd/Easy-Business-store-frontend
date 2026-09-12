'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartClient03() {
  const { cartItems, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  if (cartItems.length === 0) {
    return (
      <main className="lg:ml-64 flex-1 flex flex-col items-center justify-center text-center py-24 px-6 bg-[#050505] border-l border-white/10 h-screen">
        <div className="text-[100px] font-black text-white/5 mb-8 leading-none">00</div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">DATABANK EMPTY</h2>
        <p className="text-gray-500 font-mono text-sm mb-8 max-w-sm uppercase">No items allocated to your current session.</p>
        <Link href="/categories" className="px-8 py-4 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] hover:bg-white transition-colors text-xs border border-transparent hover:border-white">
          Access Directory
        </Link>
      </main>
    );
  }

  return (
    <main className="lg:ml-64 flex-1 w-full bg-[#050505] border-l border-white/10 min-h-screen">
      <div className="w-full px-8 py-4 flex items-center text-xs font-mono uppercase tracking-widest text-gray-500 gap-3 border-b border-white/10 bg-black">
        <Link href="/" className="hover:text-cyan-400 transition-colors">ROOT</Link>
        <span className="text-white/20">/</span>
        <span className="text-white">CART</span>
      </div>

      <div className="p-8 md:p-12 border-b border-white/10 bg-black">
        <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase tracking-widest">TRANSACTION PENDING</div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">CART [ {totalItems} ]</h2>
      </div>

      <div className="flex flex-col lg:flex-row border-b border-white/10 h-full">
        {/* Cart Items */}
        <div className="flex-1 lg:border-r border-white/10 bg-[#050505]">
          {cartItems.map((item) => (
            <div key={item.id} className="flex flex-row items-center border-b border-white/10 last:border-b-0 p-4 md:p-8 hover:bg-[#0a0a0a] transition-colors group gap-4 sm:gap-8">
              <div className="w-20 h-20 sm:w-32 sm:h-32 bg-[#111] overflow-hidden shrink-0 border border-white/10 p-2 sm:p-4 relative flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
                ) : (
                  <div className="text-[8px] sm:text-[10px] text-gray-600 font-mono">NO IMG</div>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="text-[8px] sm:text-[10px] text-gray-500 font-mono mb-1 uppercase tracking-widest">ID: {item.id.substring(0,8)}</div>
                <h4 className="text-sm sm:text-xl font-black uppercase tracking-tighter text-white mb-1 sm:mb-2 line-clamp-2">{item.title}</h4>
                <p className="text-lg sm:text-2xl font-black text-cyan-400 tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 shrink-0">
                <div className="flex items-center border border-white/20 bg-black">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-mono font-bold text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/30 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-96 shrink-0 bg-black">
          <div className="p-8 md:p-12 sticky top-0">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">ORDER SUMMARY</h3>
            <div className="space-y-6 mb-8 text-xs font-mono uppercase tracking-widest">
              <div className="flex justify-between text-gray-500">
                <span>SUBTOTAL [{totalItems}]</span>
                <span className="text-white">৳{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>DELIVERY</span>
                <span className="text-white">৳120</span>
              </div>
              <div className="pt-6 border-t border-white/10 flex justify-between text-white font-black text-xl tracking-tighter">
                <span>TOTAL</span>
                <span className="text-cyan-400">৳{(totalPrice + 120).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-cyan-400 text-black font-black py-5 hover:bg-white transition-colors text-xs uppercase tracking-[0.2em] border border-cyan-400 hover:border-white mb-4"
            >
              [ INITIALIZE CHECKOUT ]
            </button>
            <Link href="/categories" className="block text-center text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-cyan-400 transition-colors">
              &larr; CONTINUE BROWSING
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
