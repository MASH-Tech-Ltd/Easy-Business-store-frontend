'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '@/context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FloatingChatWidget, { ChatWidgetConfig } from './FloatingChatWidget';

export default function Providers({
  children,
  chatWidget,
  storeName,
  primaryColor,
}: {
  children: React.ReactNode;
  chatWidget?: ChatWidgetConfig | null;
  storeName?: string;
  primaryColor?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <CartProvider>
      {children}
      <FloatingChatWidget
        chatWidget={chatWidget}
        storeName={storeName}
        primaryColor={primaryColor}
      />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </CartProvider>
  );
}
