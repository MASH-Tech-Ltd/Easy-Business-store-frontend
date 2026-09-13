import type { NextConfig } from "next";
import { EventEmitter } from "events";

// Increase max listeners to suppress Gzip EventEmitter memory leak warnings in dev
EventEmitter.defaultMaxListeners = 50;

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
