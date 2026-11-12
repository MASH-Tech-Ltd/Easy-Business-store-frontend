'use client';

import { useEffect, useRef } from 'react';

export interface CheckoutLeadTrackItem {
  productId?: string | undefined;
  title: string;
  price?: number | undefined;
  quantity: number;
  image?: string | undefined;
  color?: string | undefined;
  size?: string | undefined;
}

export interface CheckoutLeadTrackPayload {
  firstName?: string | undefined;
  lastName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  address?: string | undefined;
  division?: string | undefined;
  district?: string | undefined;
  upazila?: string | undefined;
  items: CheckoutLeadTrackItem[];
  isSuccess: boolean;
  isProcessing: boolean;
}

function getLeadStorageKey(): string {
  if (typeof window === 'undefined') return 'checkout_lead_id';
  return `checkout_lead_id_${window.location.host}`;
}

export function getSavedCheckoutLeadId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage.getItem(getLeadStorageKey()) || undefined;
  } catch {
    return undefined;
  }
}

export function clearSavedCheckoutLeadId(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(getLeadStorageKey());
  } catch {
    // ignore storage errors
  }
}

function saveCheckoutLeadId(id: string): void {
  if (typeof window === 'undefined' || !id) return;
  try {
    window.localStorage.setItem(getLeadStorageKey(), id);
  } catch {
    // ignore storage errors
  }
}

/**
 * Automatically tracks and updates abandoned checkout leads on the server
 * whenever any checkout field or cart item changes, including a beacon flush on tab close.
 */
export function useCheckoutLeadTracker(payload: CheckoutLeadTrackPayload): void {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    division,
    district,
    upazila,
    items,
    isSuccess,
    isProcessing,
  } = payload;

  const latestBodyRef = useRef<string | null>(null);
  const lastSyncedBodyRef = useRef<string | null>(null);
  const serializedItems = JSON.stringify(items);

  useEffect(() => {
    if (isSuccess) {
      clearSavedCheckoutLeadId();
      latestBodyRef.current = null;
      lastSyncedBodyRef.current = null;
      return;
    }

    const hasAnyField = Boolean(
      phone?.trim() ||
        email?.trim() ||
        firstName?.trim() ||
        lastName?.trim() ||
        address?.trim() ||
        division?.trim() ||
        district?.trim() ||
        upazila?.trim()
    );

    if (!hasAnyField || isProcessing) return;

    const leadId = getSavedCheckoutLeadId();
    const requestPayload = {
      ...(leadId ? { leadId } : {}),
      firstName,
      lastName,
      email,
      phone,
      address,
      division,
      district,
      upazila,
      items: JSON.parse(serializedItems),
      status: 'abandoned' as const,
    };

    const serialized = JSON.stringify(requestPayload);
    latestBodyRef.current = serialized;
    if (serialized === lastSyncedBodyRef.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/checkout-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: serialized,
          keepalive: true,
        });
        if (res.ok) {
          lastSyncedBodyRef.current = serialized;
          const json = await res.json().catch(() => null);
          const returnedId = json?.data?._id;
          if (typeof returnedId === 'string' && returnedId) {
            saveCheckoutLeadId(returnedId);
          }
        }
      } catch (err) {
        console.error('Failed to track lead', err);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [
    firstName,
    lastName,
    email,
    phone,
    address,
    division,
    district,
    upazila,
    serializedItems,
    isSuccess,
    isProcessing,
  ]);

  // Flush any unsent field change immediately if the user closes/hides the tab
  useEffect(() => {
    const flushPendingLead = () => {
      const pending = latestBodyRef.current;
      if (!pending || pending === lastSyncedBodyRef.current) return;
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([pending], { type: 'application/json' });
        navigator.sendBeacon('/api/checkout-leads', blob);
        lastSyncedBodyRef.current = pending;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushPendingLead();
      }
    };

    window.addEventListener('pagehide', flushPendingLead);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushPendingLead);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
