import type { NextConfig } from "next";
import { EventEmitter } from "events";
import path from "path";

// Increase max listeners to suppress Gzip EventEmitter memory leak warnings in dev
EventEmitter.defaultMaxListeners = 50;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, './'),
  async rewrites() {
    return [
      {
        source: '/.well-known/acme-challenge/:token',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/.well-known/acme-challenge/:token`,
      },
      {
        source: '/.well-known/cf-custom-hostname-challenge/:uuid',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'}/.well-known/cf-custom-hostname-challenge/:uuid`,
      },
    ];
  },
};

export default nextConfig;
