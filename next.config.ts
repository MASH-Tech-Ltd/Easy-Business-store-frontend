import type { NextConfig } from "next";
import { EventEmitter } from "events";

// Increase max listeners to suppress Gzip EventEmitter memory leak warnings in dev
EventEmitter.defaultMaxListeners = 50;

const nextConfig: NextConfig = {
  // Compress all responses using gzip/brotli
  compress: true,

  // Hide server tech stack header for security
  poweredByHeader: false,

  // Client-side Router Cache optimization (instant sub-10ms page navigation)
  experimental: {
    staleTimes: {
      dynamic: 60, // Cache dynamic server component trees in browser for 60s
      static: 300, // Cache static segments in browser for 5 minutes
    },
  },

  // Modern next/image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Security and long-lived static asset caching headers
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/.well-known/acme-challenge/:token",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5000"}/.well-known/acme-challenge/:token`,
      },
      {
        source: "/.well-known/cf-custom-hostname-challenge/:uuid",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5000"}/.well-known/cf-custom-hostname-challenge/:uuid`,
      },
    ];
  },
};

export default nextConfig;
