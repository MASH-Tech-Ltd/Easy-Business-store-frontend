import React from 'react';
import CartClient04 from './CartClient';
import Footer04 from './components/layout/Footer';
import Header04 from './components/layout/Header';

export default function CartPage04() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header04 />
      <CartClient04 />
      <Footer04 />
    </div>
  );
}
