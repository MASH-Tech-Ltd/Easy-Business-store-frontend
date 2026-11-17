"use client";

interface DynamicFaviconProps {
  iconUrl?: string;
  appleIconUrl?: string;
}

/**
 * DynamicFavicon - Kept as a safe no-op component.
 * Favicons are managed directly and persistently via layout metadata and static head links
 * to prevent tab icon blinking/re-rendering during client-side route transitions.
 */
export default function DynamicFavicon(_props: DynamicFaviconProps) {
  return null;
}
