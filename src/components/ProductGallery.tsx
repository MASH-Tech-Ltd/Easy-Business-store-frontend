'use client';

import { useState, useEffect, MouseEvent } from 'react';
import { getProductMainImageUrl, getProductGalleryImageUrl, getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface ProductGalleryProps {
  images?: any[];
  image?: any;
  title: string;
}

export default function ProductGallery({ images, image, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [transformOrigin, setTransformOrigin] = useState('center');
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  // Extract all valid image URLs directly without URL modifications
  const imageList: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img) => {
      const u = typeof img === 'string' ? img : img?.secure_url || img?.url || '';
      if (u) imageList.push(u);
    });
  }

  if (imageList.length === 0 && image) {
    const u = typeof image === 'string' ? image : image?.secure_url || image?.url || '';
    if (u) imageList.push(u);
  }

  if (imageList.length === 0) {
    return (
      <div className="bg-gray-100 rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
        <div className="text-gray-400">No image available</div>
      </div>
    );
  }

  const currentImage = imageList[activeIndex] || imageList[0];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6 h-full items-start">
      {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
      {imageList.length > 1 && (
        <div className="flex md:flex-col gap-4 flex-wrap md:flex-nowrap w-full md:w-24 pb-2 md:pb-0 md:pr-2">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveIndex(idx); setImageLoaded(false); }}
              className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx ? 'border-gray-900 shadow-md ring-2 ring-gray-900/10' : 'border-gray-100 hover:border-gray-400 opacity-60 hover:opacity-100'
              } bg-white p-0`}
            >
              <img 
                src={getOptimizedImageUrl(imgUrl, 100)} 
                alt={`${title} thumbnail ${idx + 1}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="flex-1 bg-gray-50 rounded-3xl aspect-square flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm relative w-full cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Instant blurred micro-thumbnail (loads in ~5ms, eliminates blank space) */}
        <img
          src={getOptimizedImageUrl(currentImage, 50)}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="sync"
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60 pointer-events-none"
        />

        {/* Shimmer skeleton before 500px image completes loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100/40 animate-pulse pointer-events-none" />
        )}

        {/* Main 500px crisp product image */}
        <img 
          src={getProductMainImageUrl(currentImage)} 
          alt={title} 
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => setImageLoaded(true)}
          style={{ transformOrigin: isZoomed ? transformOrigin : 'center' }}
          className={`w-full h-full object-cover relative z-10 transition-all duration-300 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isZoomed ? 'scale-[1.5]' : 'scale-100'}`} 
        />
      </div>
    </div>
  );
}
