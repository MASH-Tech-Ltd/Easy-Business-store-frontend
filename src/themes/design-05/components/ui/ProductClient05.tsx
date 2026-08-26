'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function ProductClient05({ product, theme }: { product: any; theme?: any }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.images?.[0]?.secure_url || product.image || '');
  const [quantity, setQuantity] = useState(1);

  const price = product.discountedPrice || product.originalPrice || product.price || 0;
  const hasDiscount = product.originalPrice && product.originalPrice > price;
  const inStock = product.stock > 0 || product.inStock;

  const handleAddToCart = () => {
    addToCart({
      id: product._id || product.id,
      title: product.title || product.name,
      price,
      image: activeImage,
      tenantId: product.tenantId || 'main',
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
      
      {/* Breadcrumb */}
      <div className="flex items-center text-[13px] font-semibold text-gray-400 uppercase tracking-widest gap-3 mb-10">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/products" className="hover:text-black transition-colors">Products</Link>
        <span className="text-gray-300">/</span>
        <span className="text-black truncate max-w-[200px]">{product.title || product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Images */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="aspect-[4/4] bg-[#F8F9FA] rounded-[2rem] p-12 flex items-center justify-center overflow-hidden border border-gray-100">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="text-gray-300 font-bold uppercase tracking-widest">No Image</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {product.images.map((img: any, idx: number) => (
                <button key={idx} onClick={() => setActiveImage(img.secure_url)}
                  className={`w-24 h-24 shrink-0 rounded-2xl bg-[#F8F9FA] border p-2 flex items-center justify-center transition-all ${
                    activeImage === img.secure_url ? 'border-black shadow-sm' : 'border-transparent hover:border-gray-200'
                  }`}>
                  <img src={img.secure_url} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:w-1/2 flex flex-col justify-center">
          <div className="mb-8 border-b border-gray-100 pb-8">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">{product.brand || 'Minimal'}</div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              {product.title || product.name}
            </h1>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-semibold text-gray-900">৳{price.toLocaleString()}</span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {inStock ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-widest rounded-full">
                  <Check className="w-3.5 h-3.5" /> In Stock
                </div>
              ) : (
                <div className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest rounded-full">
                  Out of Stock
                </div>
              )}
            </div>

            <p className="text-gray-500 text-lg leading-relaxed">
              {product.shortDescription || product.description || 'Premium quality product designed for the modern lifestyle.'}
            </p>
          </div>

          <div className="mb-10">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quantity</label>
            <div className="flex items-center border border-gray-200 rounded-full w-fit p-1 bg-white shadow-sm">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <span className="w-12 text-center font-semibold text-lg text-gray-900">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button onClick={handleAddToCart} disabled={!inStock}
              style={theme?.buttonColors?.addToCart ? { backgroundColor: theme.buttonColors.addToCart, borderColor: theme.buttonColors.addToCart, color: '#fff' } : {}}
              className="flex-1 bg-white border border-gray-200 text-gray-900 font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={!inStock}
              style={theme?.buttonColors?.buyNow ? { backgroundColor: theme.buttonColors.buyNow } : theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
              className="flex-1 bg-black text-white font-semibold py-4 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Buy Now
            </button>
          </div>

          {/* Description Section */}
          <div className="border border-gray-100 rounded-3xl p-8 bg-[#F8F9FA]">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Product Information</h3>
            <div className="prose prose-sm text-gray-600 max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description || 'No additional details available.' }} />
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 tracking-tight text-center">Technical Specifications</h2>
          <div className="max-w-4xl mx-auto space-y-12">
            {product.specifications.map((group: any, gIdx: number) => (
              <div key={gIdx}>
                <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-6 pb-4 border-b border-gray-100">{group.group}</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                  {group.entries.map((entry: any, eIdx: number) => (
                    <div key={eIdx} className="flex justify-between items-start border-b border-dashed border-gray-200 pb-3">
                      <dt className="text-sm font-medium text-gray-500 w-1/2 pr-4">{entry.name}</dt>
                      <dd className="text-sm font-semibold text-gray-900 w-1/2 text-right">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Videos Section */}
      {product.videos && product.videos.length > 0 && (
        <div className="mt-24 pt-16 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-12 tracking-tight text-center">Product Videos</h2>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.videos.map((video: string, index: number) => {
              let embedUrl = video;
              try {
                const url = new URL(video);
                if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
                  const videoId = url.hostname.includes('youtu.be') ? url.pathname.slice(1) : url.searchParams.get('v');
                  if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
              } catch (e) {}
              return (
                <div key={index} className="aspect-video bg-gray-50 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 p-2">
                  <iframe 
                    src={embedUrl}
                    title={`Product Video ${index + 1}`}
                    className="w-full h-full rounded-[1.5rem]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
