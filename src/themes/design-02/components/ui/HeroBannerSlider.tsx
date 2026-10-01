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

export default function HeroBannerSlider02({ banner }: HeroBannerSliderProps) {
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
    <section className="w-full bg-white">
      <div 
        className="max-w-7xl mx-auto w-full relative overflow-hidden flex flex-col justify-center aspect-[21/9] max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] xl:max-h-[650px] sm:mt-4 sm:rounded-2xl shadow-sm group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images Slider */}
        {images.length > 0 ? (
          <div className="absolute inset-0 z-0">
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                } transition-transform duration-1000`}
              >
                <img
                  src={imgUrl}
                  alt={banner?.title || `Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gray-50" />
        )}

        {/* Content */}
        <div className="relative z-20 flex flex-col justify-center pointer-events-none w-full h-full">
          <div className="w-full px-6 sm:px-12">
            <div className="max-w-2xl text-left pointer-events-auto py-8 lg:py-16">
              {banner?.subtitle && (
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider uppercase text-blue-300 mb-2">
                  {banner.subtitle}
                </span>
              )}
              {banner?.title && (
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-4 text-white leading-[1.1] whitespace-pre-line">
                  {banner.title}
                </h2>
              )}
              {banner?.description && (
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-4 sm:mb-8 max-w-xl font-medium line-clamp-2 sm:line-clamp-3">
                  {banner.description}
                </p>
              )}
              {banner?.buttonText && banner?.buttonLink && (
                <Link
                  prefetch={false}
                  href={banner.buttonLink}
                  className="inline-block px-6 sm:px-10 py-2.5 sm:py-4 bg-white text-gray-900 rounded-full text-xs sm:text-sm font-bold tracking-wide hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl duration-300"
                >
                  {banner.buttonText}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Indicator Dots (if > 1 image) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-12 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex ? 'w-6 sm:w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
