'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBannerImageUrl } from '@/utils/imageOptimizer';

interface HeroBannerSliderProps {
  banner?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    showBannerContent?: boolean;
    image?: any;
    images?: any[];
  };
}

const DEFAULT_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
    title: 'Featured Collection',
    subtitle: 'Premium Quality & Authentic Craftsmanship',
    link: '/products',
    buttonText: 'Buy Now',
  },
  {
    image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1600&q=80',
    title: 'New Season Arrivals',
    subtitle: 'Discover The Latest Trending Styles',
    link: '/categories',
    buttonText: 'Explore Collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&q=80',
    title: 'Curated Deals & Offers',
    subtitle: 'Handpicked Picks With Fast Nationwide Delivery',
    link: '/products',
    buttonText: 'Shop New Arrivals',
  },
];

export default function HeroBannerSlider06({ banner }: HeroBannerSliderProps) {
  const customImages: string[] = React.useMemo(() => {
    if (banner?.images && Array.isArray(banner.images) && banner.images.length > 0) {
      return banner.images
        .map((img: any) => (typeof img === 'string' ? img : img?.secure_url || img?.url))
        .filter(Boolean);
    }
    if (banner?.image?.secure_url) return [banner.image.secure_url];
    if (banner?.image?.url) return [banner.image.url];
    if (typeof banner?.image === 'string') return [banner.image];
    return [];
  }, [banner]);

  const slides = React.useMemo(() => {
    if (customImages.length > 0) {
      return customImages.map((imgUrl, i) => ({
        image: imgUrl,
        title: banner?.title || (i === 0 ? 'Featured Collection' : 'Exclusive Arrivals'),
        subtitle: banner?.subtitle || '',
        description: banner?.description || '',
        link: banner?.buttonLink || '/products',
        buttonText: banner?.buttonText || 'Buy Now',
      }));
    }
    return DEFAULT_SLIDES;
  }, [customImages, banner]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused, nextSlide]);

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-3 sm:pt-6">
      <div
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[165px] sm:min-h-[280px] max-h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-md"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slide Images */}
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={getBannerImageUrl(slide.image)}
                alt={slide.title}
                className={`w-full h-full object-cover object-center transform transition-transform duration-10000 ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
              {/* Dark Luxury Vignette & Overlay (only when banner content is visible) */}
              {banner?.showBannerContent !== false && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/35" />
                  <div className="absolute inset-0 bg-black/25" />
                </>
              )}
            </div>
          );
        })}

        {/* Slide Content - Centered */}
        {banner?.showBannerContent !== false && (
          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center animate-in fade-in duration-700">
            {activeSlide.subtitle && (
              <span className="inline-block bg-black text-white text-[9px] sm:text-xs font-semibold tracking-[0.15em] sm:tracking-[0.2em] uppercase px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded sm:rounded-md border border-white/15 mb-1.5 sm:mb-4 shadow-md">
                {activeSlide.subtitle}
              </span>
            )}

            <h2 className="font-heading text-base xs:text-xl sm:text-3xl md:text-5xl text-white font-normal tracking-tight max-w-3xl leading-[1.15] mb-2.5 sm:mb-6 drop-shadow-md">
              {activeSlide.title}
            </h2>

            <div className="flex items-center justify-center">
              <Link
                href={activeSlide.link || '/products'}
                prefetch={false}
                className="inline-flex items-center gap-1 sm:gap-2 bg-white text-gray-900 font-semibold px-3 py-1 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm hover:bg-gray-100 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm group cursor-pointer"
              >
                <ShoppingCart className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-gray-900 group-hover:-rotate-6 transition-transform" />
                <span>{activeSlide.buttonText || 'Buy Now'}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Arrows for md+ */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center backdrop-blur-xs border border-white/15 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel Indicators (matching the image: elongated pill + dots) */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-8 h-2 bg-white rounded-full'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70 rounded-full'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
