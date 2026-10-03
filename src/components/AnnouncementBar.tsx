'use client';
import React from 'react';

interface AnnouncementBarProps {
  banner?: any;
  currencySymbol?: string;
}

export default function AnnouncementBar({ banner, currencySymbol }: AnnouncementBarProps) {
  if (!banner) return null;

  // Determine if announcement bar should be rendered
  const show = banner?.showAnnouncement ?? (banner?.announcementText ? true : false);
  if (!show) return null;

  const text = banner?.announcementText || `Free shipping on orders over ${currencySymbol || '৳'}999 | All Products`;
  if (!text || !text.trim()) return null;

  const isSliding = Boolean(banner?.isSliding);
  const bgColor = banner?.announcementBgColor || '#0f172a';
  const textColor = banner?.announcementTextColor || '#ffffff';

  if (isSliding) {
    return (
      <div 
        style={{ backgroundColor: bgColor, color: textColor }}
        className="text-xs sm:text-sm font-medium py-2 overflow-hidden border-b border-black/10 w-full relative z-[60] transition-colors select-none"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes singleMarqueeSlide {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .single-marquee-text {
            display: inline-block;
            white-space: nowrap;
            will-change: transform;
            animation: singleMarqueeSlide 38s linear infinite;
          }
        ` }} />
        <div className="single-marquee-text tracking-wide">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="text-center text-xs sm:text-sm font-medium py-2 px-4 tracking-wide border-b border-black/10 w-full relative z-[60] transition-colors"
    >
      <span>{text}</span>
    </div>
  );
}
