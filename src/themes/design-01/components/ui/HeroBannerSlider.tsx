'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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

export default function HeroBannerSlider({ banner }: HeroBannerSliderProps) {
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
    <section 
      className="max-w-[1400px] w-full mx-auto bg-gradient-to-r from-blue-900 to-indigo-800 text-white relative overflow-hidden flex flex-col justify-center min-h-[230px] sm:min-h-[340px] aspect-[21/9] lg:aspect-[2.5/1] xl:aspect-[3/1] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Slider */}
      {images.length > 0 && (
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
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {/* Dark overlay to ensure white text is readable over the banner */}
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>
      )}

      {/* Content Overlay */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 md:px-8 relative z-20 py-4 sm:py-8">
        <div className="max-w-2xl">
          {banner?.subtitle && (
            <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 text-blue-200 text-xs sm:text-sm font-semibold mb-3 sm:mb-4 md:mb-6 border border-blue-700/50 backdrop-blur-sm">
              {banner.subtitle}
            </span>
          )}
          {banner?.title && (
            <h1 className="text-[clamp(1.75rem,5vw,4rem)] font-extrabold tracking-tight mb-3 sm:mb-4 md:mb-6 leading-tight whitespace-pre-line">
              {banner.title}
            </h1>
          )}
          {banner?.description && (
            <p className="text-[clamp(0.875rem,2vw,1.25rem)] text-blue-100 mb-5 sm:mb-6 md:mb-8 leading-relaxed">
              {banner.description}
            </p>
          )}
          {banner?.buttonText && banner?.buttonLink && (
            <Link
              prefetch={false}
              href={banner.buttonLink}
              className="inline-flex items-center gap-1 sm:gap-2 bg-white text-indigo-900 px-3 py-1.5 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-sm md:text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              {banner.buttonText}{' '}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Indicator Dots (if > 1 image) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 right-6 sm:right-10 z-30 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
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
    </section>
  );
}
