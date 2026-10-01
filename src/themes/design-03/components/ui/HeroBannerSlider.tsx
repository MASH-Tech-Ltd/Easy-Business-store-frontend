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

export default function HeroBannerSlider03({ banner }: HeroBannerSliderProps) {
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
      className="relative flex flex-col border-b border-white/10 min-h-[70vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full flex-1">
        {/* Left side: Typography & Actions */}
        <div className="p-8 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
          <div className="relative z-10">
            <div className="inline-block px-3 py-1 bg-cyan-400 text-black text-[10px] font-black uppercase tracking-widest mb-6">
              {banner?.subtitle || 'System Initialized'}
            </div>
            {banner?.title && (
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                {banner.title}
              </h2>
            )}
            {banner?.description && (
              <p className="text-lg md:text-xl text-gray-400 font-mono mb-12 max-w-xl leading-relaxed">
                {banner.description}
              </p>
            )}
            {banner?.buttonText && banner?.buttonLink && (
              <Link
                prefetch={false}
                href={banner.buttonLink}
                className="inline-flex items-center justify-center px-12 py-5 bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-colors border border-transparent hover:border-white"
              >
                {banner.buttonText}
              </Link>
            )}
          </div>
        </div>

        {/* Right side: Cyberpunk Image Slider */}
        <div className="relative min-h-[40vh] md:min-h-full bg-[#050505] overflow-hidden group">
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
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-1000"
                />
              </div>
            ))
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
              <span className="text-white/10 font-mono text-2xl uppercase tracking-widest">No Signal</span>
            </div>
          )}

          {/* Tech overlay lines */}
          <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40 z-20" />

          {/* Slider Indicators (if > 1 image) */}
          {images.length > 1 && (
            <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2 bg-black/80 border border-white/20 px-3 py-1.5 font-mono text-xs text-white backdrop-blur-md">
              <span className="text-cyan-400 font-black tracking-widest mr-1">
                0{currentIndex + 1} / 0{images.length}
              </span>
              <div className="flex items-center gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 ${
                      idx === currentIndex ? 'w-4 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
