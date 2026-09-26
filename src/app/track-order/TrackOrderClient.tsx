'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import Link from 'next/link';

export function TrackOrderContent({ tenantId }: { tenantId?: string }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderId, setOrderId] = useState(initialId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchOrder = async (id: string, phn: string) => {
    if (!id || !phn) {
      setError('Both Order ID and Phone Number are required');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const url = new URL('/api/track', window.location.origin);
      url.searchParams.append('id', id);
      url.searchParams.append('phone', phn);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Order not found');
      }
      setOrder(data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have an initial ID, maybe we shouldn't auto-fetch unless we also have the phone number
    // But since phone isn't in URL, we just skip auto-fetch
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId, phone);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-8 h-8 text-blue-500" />;
      case 'shipped': return <Truck className="w-8 h-8 text-purple-500" />;
      case 'delivered': return <Package className="w-8 h-8 text-green-500" />;
      case 'cancelled': return <CheckCircle className="w-8 h-8 text-red-500" />;
      default: return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Track Your Order
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Enter your Order ID to check the current status of your shipment.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 w-full relative">
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Enter Order ID..."
                  required
                />
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-black sm:text-sm transition duration-150 ease-in-out"
                placeholder="Enter Phone Number..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {order && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Order Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  ID: #{order.orderId || order._id}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
                {getStatusIcon(order.status)}
                <span className="font-semibold text-gray-900 capitalize text-lg">
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.customerName}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.shippingAddress}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Items</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul role="list" className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            {item.image && (
                              <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded mr-3" />
                            )}
                            <span className="truncate flex-1">{item.title}</span>
                          </div>
                          <div className="ml-4 flex-shrink-0 font-medium">
                            {item.quantity} x {item.price} BDT
                          </div>
                        </li>
                      ))}
                    </ul>
                    {order.isDeliveryChargePaid && (
                      <div className="mt-8 mb-2 flex justify-center sm:justify-start">
                        <div className="border-4 border-green-500 text-green-500 font-black px-6 py-2 rounded-lg transform -rotate-6 inline-block shadow-sm opacity-90 select-none bg-white">
                          <div className="text-center leading-tight">
                            <div className="text-2xl tracking-widest uppercase">PAID</div>
                            <div className="text-sm tracking-widest uppercase">Delivery Charge</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                  <dt className="text-base font-bold text-gray-900">Total Amount</dt>
                  <dd className="mt-1 text-base font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                    {order.totalPrice} BDT
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link 
            prefetch={false} 
            href="/" 
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-200 ease-in-out hover:shadow-md transform hover:-translate-y-0.5"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
