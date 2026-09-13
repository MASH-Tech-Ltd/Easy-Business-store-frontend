import React from 'react';
import CartClient from './CartClient';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />
      <CartClient />
      <Footer />
    </div>
  );
}
