'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initTracking, trackPageView, StorefrontTrackingConfig } from '@/utils/tracking';

interface StorefrontTrackerProps {
  tenantSlug: string;
  initialConfig?: StorefrontTrackingConfig | null;
}

export default function StorefrontTracker({ tenantSlug, initialConfig }: StorefrontTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function setupTracking() {
      try {
        let config = initialConfig;

        if (!config) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/tracking`, {
            headers: {
              'x-storefront-api-key': process.env.NEXT_PUBLIC_STOREFRONT_API_KEY || '',
            },
          });
          if (res.ok) {
            const json = await res.json();
            config = json.data;
          }
        }

        if (isMounted && config) {
          initTracking(config);
          isInitialized.current = true;
          // Initial page view after script init
          const fullUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
          trackPageView(fullUrl);
        }
      } catch (err) {
        console.error('Failed to load storefront tracking config', err);
      }
    }

    setupTracking();

    return () => {
      isMounted = false;
    };
  }, [tenantSlug, initialConfig]);

  // Track pageviews on route changes after initial setup
  useEffect(() => {
    if (!isInitialized.current) return;
    const fullUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    trackPageView(fullUrl);
  }, [pathname, searchParams]);

  return null;
}
