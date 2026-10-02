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
  const MarqueeTag = 'marquee' as any;

  const bgColor = banner?.announcementBgColor || '#0f172a';
  const textColor = banner?.announcementTextColor || '#ffffff';

  if (isSliding) {
    return (
      <div 
        style={{ backgroundColor: bgColor, color: textColor }}
        className="text-sm font-medium py-2 px-4 overflow-hidden border-b border-black/10 w-full relative z-50 transition-colors"
      >
        <MarqueeTag scrollamount="6" className="whitespace-nowrap flex items-center tracking-wide">
          {text}
        </MarqueeTag>
      </div>
    );
  }

  return (
    <div 
      style={{ backgroundColor: bgColor, color: textColor }}
      className="text-center text-xs font-medium py-2 px-4 tracking-wide border-b border-black/10 w-full relative z-50 transition-colors"
    >
      <span>{text}</span>
    </div>
  );
}
