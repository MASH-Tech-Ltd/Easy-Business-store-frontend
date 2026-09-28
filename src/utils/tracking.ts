'use client';

export interface StorefrontTrackingConfig {
  googleAnalytics?: {
    enabled: boolean;
    measurementId: string;
  };
  metaPixel?: {
    enabled: boolean;
    pixelId: string;
  };
  googleTagManager?: {
    enabled: boolean;
    containerId: string;
  };
  isPlatform?: boolean;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbq: any;
    __ga4_initialized?: string;
    __meta_pixel_initialized?: string;
    __gtm_initialized?: string;
  }
}

// Initialize tracking scripts dynamically
export function initTracking(config: StorefrontTrackingConfig) {
  if (typeof window === 'undefined') return;

  // 1. Google Analytics 4 (GA4)
  if (config?.googleAnalytics?.enabled && config.googleAnalytics.measurementId) {
    const measurementId = config.googleAnalytics.measurementId.trim();
    if (window.__ga4_initialized !== measurementId) {
      window.__ga4_initialized = measurementId;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      window.gtag('config', measurementId, { send_page_view: false });
    }
  }

  // 2. Meta Pixel
  if (config?.metaPixel?.enabled && config.metaPixel.pixelId) {
    const pixelId = config.metaPixel.pixelId.trim();
    if (window.__meta_pixel_initialized !== pixelId) {
      window.__meta_pixel_initialized = pixelId;

      /* eslint-disable */
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */

      window.fbq('init', pixelId);

      // Noscript fallback element for Meta Pixel
      if (!document.getElementById('meta-pixel-noscript')) {
        const noscript = document.createElement('noscript');
        noscript.id = 'meta-pixel-noscript';
        noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
        document.body.appendChild(noscript);
      }
    }
  }

  // 3. Google Tag Manager (GTM)
  if (config?.googleTagManager?.enabled && config.googleTagManager.containerId) {
    const containerId = config.googleTagManager.containerId.trim();
    if (window.__gtm_initialized !== containerId) {
      window.__gtm_initialized = containerId;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js',
      });

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
      document.head.appendChild(script);
    }
  }
}

// Track page views on route changes
export function trackPageView(url: string) {
  if (typeof window === 'undefined') return;

  // GA4 PageView
  if (typeof window.gtag === 'function' && window.__ga4_initialized) {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }

  // Meta Pixel PageView
  if (typeof window.fbq === 'function' && window.__meta_pixel_initialized) {
    window.fbq('track', 'PageView');
  }

  // GTM dataLayer push
  if (window.dataLayer && window.__gtm_initialized) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}

// Central Event Tracking Abstraction
export function trackEvent(eventName: string, data: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  // Deduplication guard for purchase events
  if (eventName === 'purchase' && data.orderId) {
    const storageKey = `__tracked_order_${data.orderId}`;
    if (sessionStorage.getItem(storageKey)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Tracking] Purchase event for order ${data.orderId} already tracked. Skipping duplicate.`);
      }
      return;
    }
    sessionStorage.setItem(storageKey, 'true');
  }

  // 1. Google Analytics 4 Events
  if (typeof window.gtag === 'function' && window.__ga4_initialized) {
    window.gtag('event', eventName, data);
  }

  // 2. Meta Pixel Events (Map to Standard Meta Pixel Event Names)
  if (typeof window.fbq === 'function' && window.__meta_pixel_initialized) {
    const metaEventMap: Record<string, string> = {
      view_item: 'ViewContent',
      add_to_cart: 'AddToCart',
      begin_checkout: 'InitiateCheckout',
      purchase: 'Purchase',
      search: 'Search',
    };

    const metaEventName = metaEventMap[eventName];
    if (metaEventName) {
      window.fbq('track', metaEventName, {
        content_name: data.title || data.name || '',
        content_ids: data.id ? [String(data.id)] : data.ids || [],
        value: data.value || data.price || 0,
        currency: data.currency || 'BDT',
      });
    } else {
      window.fbq('trackCustom', eventName, data);
    }
  }

  // 3. GTM DataLayer Push
  if (window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      ecommerce: data,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Tracking Event Fired] ${eventName}`, data);
  }
}
