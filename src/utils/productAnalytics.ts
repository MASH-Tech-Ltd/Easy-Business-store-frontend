'use client';

/**
 * MASH ECO — Storefront Product & Store Analytics Client
 * Handles batching, session deduplication, bot filtering,
 * and reliable transmission of product impressions & clicks.
 */

export interface TrackEventItem {
  eventType: 'product_impression' | 'product_click' | 'store_visit';
  productId?: string;
  sourcePage?: string;
  sourceSection?: string;
  timestamp: string;
}

const BATCH_FLUSH_INTERVAL_MS = 2500;
const MAX_BATCH_SIZE = 20;

let eventQueue: TrackEventItem[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let currentTenantId: string = '';

// Session-level deduplication set: prevents duplicate impressions during the same browsing session
const sessionImpressionSet = new Set<string>();
const recentClickTimestamps = new Map<string, number>();

/**
 * Determines if current client is an excluded bot, preview, or crawler
 */
export const isTrackingExcluded = (): boolean => {
  if (typeof window === 'undefined') return true;

  // 1. Crawler / Bot check
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/bot|crawler|spider|googlebot|bingbot|yandex|baiduspider|duckduckbot/i.test(ua)) {
    return true;
  }

  // 2. Internal Dashboard Preview check (e.g. ?preview=true or inside merchant theme preview iframe)
  const search = window.location.search.toLowerCase();
  if (search.includes('preview=') || search.includes('ispreview=') || search.includes('isinternalpreview=')) {
    return true;
  }
  if (window.self !== window.top) {
    try {
      // If parent is dashboard or preview frame
      return true;
    } catch {}
  }

  // 3. Exclude admin/merchant preview domains if any
  const host = window.location.host.toLowerCase();
  if (host.startsWith('admin.') || host.startsWith('merchant.') || host.startsWith('super.')) {
    return true;
  }

  return false;
};

/**
 * Gets or initializes privacy-conscious session ID
 */
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sId = sessionStorage.getItem('visitor_session_id');
    if (!sId) {
      sId = crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('visitor_session_id', sId);
    }
    return sId;
  } catch {
    return 'fallback_session';
  }
};

/**
 * Gets or initializes privacy-conscious persistent visitor ID
 */
export const getVisitorId = (): string => {
  if (typeof window === 'undefined') return 'server_visitor';
  try {
    let vId = localStorage.getItem('visitor_id');
    if (!vId) {
      vId = crypto.randomUUID ? crypto.randomUUID() : `vis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('visitor_id', vId);
    }
    return vId;
  } catch {
    return 'fallback_visitor';
  }
};

/**
 * Flushes queued events to the backend
 */
export const flushAnalyticsQueue = async () => {
  if (eventQueue.length === 0 || !currentTenantId) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  const payload = {
    tenantId: currentTenantId,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    events: eventsToSend,
  };

  const payloadStr = JSON.stringify(payload);

  try {
    // Prefer sendBeacon for page unload / background safety
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payloadStr], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/analytics/track', blob);
      if (sent) return;
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      keepalive: true,
    });
  } catch {
    // Fail silently: analytics failures must never interrupt storefront browsing
  }
};

/**
 * Schedules a debounced batch flush
 */
const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushAnalyticsQueue();
  }, BATCH_FLUSH_INTERVAL_MS);
};

// Auto-flush on page unload / hide
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAnalyticsQueue();
    }
  });
  window.addEventListener('pagehide', () => {
    flushAnalyticsQueue();
  });
}

/**
 * Tracks a Product Impression
 * Counted when a product card becomes genuinely visible (>= 50% for >= 1s)
 */
export const trackProductImpression = (params: {
  productId: string;
  tenantId: string;
  sourceSection?: string;
  sourcePage?: string;
}) => {
  if (isTrackingExcluded()) return;
  if (!params.productId || !params.tenantId) return;

  currentTenantId = params.tenantId;
  const sId = getSessionId();
  const section = params.sourceSection || 'general';
  const dedupKey = `${sId}:${params.tenantId}:${params.productId}:${section}`;

  // Session-based deduplication: do not count multiple times in the same session & section
  if (sessionImpressionSet.has(dedupKey)) {
    return;
  }
  sessionImpressionSet.add(dedupKey);

  eventQueue.push({
    eventType: 'product_impression',
    productId: params.productId,
    sourcePage: params.sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    sourceSection: section,
    timestamp: new Date().toISOString(),
  });

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flushAnalyticsQueue();
  } else {
    scheduleFlush();
  }
};

/**
 * Tracks a Product Click
 * Triggered on customer click that navigates to the product details page
 */
export const trackProductClick = (params: {
  productId: string;
  tenantId: string;
  sourceSection?: string;
  sourcePage?: string;
}) => {
  if (isTrackingExcluded()) return;
  if (!params.productId || !params.tenantId) return;

  currentTenantId = params.tenantId;
  const now = Date.now();
  const lastClick = recentClickTimestamps.get(params.productId) || 0;

  // Prevent accidental duplicate clicks within 500ms
  if (now - lastClick < 500) {
    return;
  }
  recentClickTimestamps.set(params.productId, now);

  eventQueue.push({
    eventType: 'product_click',
    productId: params.productId,
    sourcePage: params.sourcePage || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    sourceSection: params.sourceSection || 'general',
    timestamp: new Date().toISOString(),
  });

  // Flush clicks immediately so navigation doesn't drop the event
  flushAnalyticsQueue();
};

