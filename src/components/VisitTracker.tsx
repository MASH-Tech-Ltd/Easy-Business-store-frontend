'use client';

import { useEffect } from 'react';

export default function VisitTracker({ tenantId }: { tenantId: string }) {
  useEffect(() => {
    if (!tenantId || typeof window === 'undefined') return;

    // Do not run visit tracker for search engine crawlers (Googlebot, Bingbot, etc.)
    // This stops Google Search Console from reporting "/api/visit blocked by robots.txt"
    const ua = (navigator.userAgent || '').toLowerCase();
    if (/bot|crawler|spider|googlebot|bingbot|yandex|baiduspider|duckduckbot/i.test(ua)) {
      return;
    }

    const trackVisit = async () => {
      try {
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem('visitor_session_id', sessionId);
        }

        await fetch('/api/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, sessionId }),
        });
      } catch (error) {
        console.error('Failed to record visit', error);
      }
    };

    trackVisit();
  }, [tenantId]);

  return null; // This component doesn't render anything
}
