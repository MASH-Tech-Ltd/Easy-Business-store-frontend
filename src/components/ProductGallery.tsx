'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import {
  getProductMainImageUrl,
  getOptimizedImageUrl,
  getProductPlaceholderImageUrl,
  rememberLoadedProductImage,
  markHighResImageLoaded,
  isHighResImageLoaded,
  preloadProductMainImage,
} from '@/utils/imageOptimizer';

interface ProductGalleryProps {
  images?: any[];
  image?: any;
  title: string;
}

export default function ProductGallery({ images, image, title }: ProductGalleryProps) {
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

  const [activeIndex, setActiveIndex] = useState(0);
  const [transformOrigin, setTransformOrigin] = useState('center');
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = imageList[activeIndex] || imageList[0] || '';
  const placeholderUrl = getProductPlaceholderImageUrl(currentImage, activeIndex === 0);
  const mainImageUrl = getProductMainImageUrl(currentImage);

  const mainImgRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Sync loaded state if the 800px high-res image is already complete in browser cache
  useEffect(() => {
    if (!currentImage) return;
    if (isHighResImageLoaded(currentImage)) {
      setImageLoaded(true);
      return;
    }
    const imgEl = mainImgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      markHighResImageLoaded(currentImage);
      setImageLoaded(true);
    } else {
      setImageLoaded(false);
    }
  }, [currentImage]);

  // Preload secondary gallery high-res images in background after mount
  useEffect(() => {
    if (imageList.length <= 1) return;
    const timer = setTimeout(() => {
      imageList.slice(1).forEach((imgUrl) => {
        preloadProductMainImage(imgUrl);
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [imageList.join('|')]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  if (imageList.length === 0) {
    return (
      <div className="bg-gray-100 rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
        <div className="text-gray-400">No image available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6 h-full items-start">
      {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
      {imageList.length > 1 && (
        <div className="flex md:flex-col gap-4 flex-wrap md:flex-nowrap w-full md:w-24 pb-2 md:pb-0 md:pr-2">
          {imageList.map((imgUrl, idx) => {
            const thumbSrc =
              idx === 0
                ? getProductPlaceholderImageUrl(imgUrl, true)
                : getOptimizedImageUrl(imgUrl, 100);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (activeIndex !== idx) {
                    const nextImg = imageList[idx];
                    setActiveIndex(idx);
                    setImageLoaded(isHighResImageLoaded(nextImg));
                  }
                }}
                onMouseEnter={() => preloadProductMainImage(imgUrl)}
                className={`w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                  activeIndex === idx ? 'border-gray-900 shadow-md ring-2 ring-gray-900/10' : 'border-gray-100 hover:border-gray-400 opacity-60 hover:opacity-100'
                } bg-white p-0`}
              >
                <img 
                  src={thumbSrc} 
                  alt={`${title} thumbnail ${idx + 1}`} 
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => rememberLoadedProductImage(imgUrl, thumbSrc)}
                  className="w-full h-full object-cover" 
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image */}
      <div 
        className="flex-1 bg-gray-50 rounded-3xl aspect-square flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm relative w-full cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Previously loaded Product Card (300px) / Thumbnail image shown immediately as placeholder */}
        <img
          src={placeholderUrl}
          alt={title}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
          style={{ transformOrigin: isZoomed ? transformOrigin : 'center' }}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out pointer-events-none ${
            isZoomed ? 'scale-[1.5]' : 'scale-100'
          }`}
        />

        {/* High-Quality Product Details Image (800px) replaces placeholder automatically once loaded */}
        <img 
          key={mainImageUrl}
          ref={mainImgRef}
          src={mainImageUrl} 
          alt={title} 
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onLoad={() => {
            markHighResImageLoaded(currentImage);
            setImageLoaded(true);
          }}
          style={{ transformOrigin: isZoomed ? transformOrigin : 'center' }}
          className={`w-full h-full object-cover relative z-10 transition-all duration-300 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } ${isZoomed ? 'scale-[1.5]' : 'scale-100'}`} 
        />
      </div>
    </div>
  );
}
