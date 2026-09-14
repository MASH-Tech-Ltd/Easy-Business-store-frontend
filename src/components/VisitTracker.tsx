'use client';

import { useEffect } from 'react';

export default function VisitTracker({ tenantId }: { tenantId: string }) {
  useEffect(() => {
    if (!tenantId) return;

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
