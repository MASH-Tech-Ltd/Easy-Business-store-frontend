'use client';

import { useEffect, useRef, useCallback } from 'react';
import { trackProductImpression, trackProductClick } from '@/utils/productAnalytics';
import { rememberLoadedProductImage, preloadProductMainImage } from '@/utils/imageOptimizer';

interface UseProductTrackerProps {
  productId?: string | number;
  tenantId?: string;
  sourceSection?: string;
}

export function useProductTracker({
  productId,
  tenantId,
  sourceSection = 'catalog',
}: UseProductTrackerProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const impressionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  const cleanProductId = productId ? String(productId) : '';
  const cleanTenantId = tenantId || 'main';

  const captureCardImage = useCallback((preloadHighRes: boolean = false) => {
    const target = elementRef.current;
    if (!target || typeof window === 'undefined') return;
    const imgEl = target.querySelector('img') as HTMLImageElement | null;
    const loadedSrc = imgEl?.currentSrc || imgEl?.src || '';
    if (loadedSrc) {
      rememberLoadedProductImage(loadedSrc, loadedSrc);
      if (preloadHighRes) {
        preloadProductMainImage(loadedSrc);
      }
    }
  }, []);

  // IntersectionObserver: >= 50% visible for >= 1 second
  useEffect(() => {
    if (!cleanProductId || !cleanTenantId || hasTriggeredRef.current) return;
    const target = elementRef.current;
    if (!target || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            captureCardImage(false);
          }
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Started being visible >= 50%
            if (!impressionTimerRef.current && !hasTriggeredRef.current) {
              impressionTimerRef.current = setTimeout(() => {
                hasTriggeredRef.current = true;
                captureCardImage(false);
                trackProductImpression({
                  productId: cleanProductId,
                  tenantId: cleanTenantId,
                  sourceSection,
                });
                observer.unobserve(target);
              }, 1000); // exactly 1 second continuous visibility threshold
            }
          } else {
            // Dropped below 50% or left viewport before 1 second elapsed
            if (impressionTimerRef.current) {
              clearTimeout(impressionTimerRef.current);
              impressionTimerRef.current = null;
            }
          }
        });
      },
      {
        threshold: [0, 0.5, 1.0],
      }
    );

    observer.observe(target);

    return () => {
      if (impressionTimerRef.current) {
        clearTimeout(impressionTimerRef.current);
        impressionTimerRef.current = null;
      }
      observer.disconnect();
    };
  }, [cleanProductId, cleanTenantId, sourceSection, captureCardImage]);

  const handleProductClick = useCallback(() => {
    captureCardImage(true);
    if (!cleanProductId || !cleanTenantId) return;
    trackProductClick({
      productId: cleanProductId,
      tenantId: cleanTenantId,
      sourceSection,
    });
  }, [cleanProductId, cleanTenantId, sourceSection, captureCardImage]);

  return {
    trackRef: elementRef as any,
    handleProductClick,
  };
}

