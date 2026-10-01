'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface HeroBannerSliderProps {
  banner?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: any;
    images?: any[];
  };
}

export default function HeroBannerSlider05({ banner }: HeroBannerSliderProps) {
  const images: string[] = React.useMemo(() => {
    if (banner?.images && Array.isArray(banner.images) && banner.images.length > 0) {
      return banner.images.map((img: any) => (typeof img === 'string' ? img : img?.secure_url)).filter(Boolean);
    }
    if (banner?.image?.secure_url) return [banner.image.secure_url];
    if (typeof banner?.image === 'string') return [banner.image];
    return [];
  }, [banner]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [images.length, isPaused, nextSlide]);

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-12 py-4 lg:py-6 max-w-[1400px] mx-auto">
      <div 
        className="bg-[#F8F9FA] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col-reverse lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-10 relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left: Banner Content */}
        <div className="lg:w-1/2 z-10 relative text-center lg:text-left mt-4 lg:mt-0 w-full">
          {banner?.subtitle && (
            <span className="inline-block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
              {banner.subtitle}
            </span>
          )}
          {banner?.title && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-[1.1] mb-3 sm:mb-5">
              {banner.title}
            </h2>
          )}
          {banner?.description && (
            <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0 leading-relaxed">
              {banner.description}
            </p>
          )}
          {banner?.buttonText && banner?.buttonLink && (
            <Link
              prefetch={false}
              href={banner.buttonLink}
              className="inline-flex items-center justify-center bg-black text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors gap-2 group/btn shadow-md hover:shadow-lg"
            >
              {banner.buttonText}
              <svg
                className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Right: Floating Image Slider */}
        <div className="lg:w-1/2 relative flex justify-center aspect-[21/9] w-full mb-2 lg:mb-0">
          <div className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden drop-shadow-2xl z-10 bg-white">
            {images.length > 0 ? (
              images.map((imgUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  } transition-transform duration-1000`}
                >
                  <img
                    src={imgUrl}
                    alt={banner?.title || `Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10">
                <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Pill indicators (if > 1 image) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Decorative circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-gray-200/50 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
