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
  featuredProductImage?: string;
}

export default function HeroBannerSlider04({ banner, featuredProductImage }: HeroBannerSliderProps) {
  const images: string[] = React.useMemo(() => {
    if (banner?.images && Array.isArray(banner.images) && banner.images.length > 0) {
      return banner.images.map((img: any) => (typeof img === 'string' ? img : img?.secure_url)).filter(Boolean);
    }
    if (banner?.image?.secure_url) return [banner.image.secure_url];
    if (typeof banner?.image === 'string') return [banner.image];
    if (featuredProductImage) return [featuredProductImage];
    return [];
  }, [banner, featuredProductImage]);

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
      className="relative overflow-hidden bg-gray-900 lg:bg-gray-100 aspect-[21/9] lg:aspect-auto flex flex-col justify-center group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Mobile & Tablet Background Image & Gradient (Visible only < lg) */}
      <div className="absolute inset-0 z-0 lg:hidden">
        {images.length > 0 ? (
          <>
            {images.map((imgUrl, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={banner?.title || `Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30 z-10" />
          </>
        ) : (
          <div className="w-full h-full bg-gray-900" />
        )}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-2 sm:py-4 lg:py-20 grid lg:grid-cols-2 gap-4 lg:gap-10 items-center">
        {/* Left: Text */}
        <div className="text-white lg:text-gray-900 flex flex-col justify-center h-full">
          {banner?.subtitle && (
            <p className="text-[10px] sm:text-xs lg:text-sm font-semibold tracking-widest uppercase mb-1 lg:mb-3 text-gray-300 lg:text-gray-400">
              {banner.subtitle}
            </p>
          )}
          {banner?.title && (
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-1 sm:mb-2 lg:mb-5">
              {banner.title}
            </h2>
          )}
          {banner?.description && (
            <p className="text-xs sm:text-sm md:text-lg mb-2 sm:mb-4 lg:mb-8 max-w-md leading-snug lg:leading-relaxed text-gray-200 lg:text-gray-400 line-clamp-1 sm:line-clamp-2 lg:line-clamp-none">
              {banner.description}
            </p>
          )}
          {banner?.buttonText && banner?.buttonLink && (
            <div>
              <Link
                prefetch={false}
                href={banner.buttonLink}
                className="inline-block font-bold px-6 py-2 sm:px-6 sm:py-2.5 md:px-10 md:py-4 rounded-full transition-colors shadow-xl lg:shadow-none bg-white text-gray-900 hover:bg-gray-100 lg:bg-gray-900 lg:text-white lg:hover:bg-gray-700 text-xs sm:text-sm md:text-base"
              >
                {banner.buttonText}
              </Link>
            </div>
          )}
        </div>

        {/* Right: Hero Image Slider (Visible only >= lg) */}
        <div className="hidden lg:flex relative justify-center items-center">
          <div className="w-full max-h-[480px] aspect-square bg-gray-50 rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center">
            {images.length > 0 ? (
              images.map((imgUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={banner?.title || `Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="text-gray-300 text-sm">No image available</div>
            )}

            {/* Dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
