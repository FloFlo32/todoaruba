import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
  },
};

export default nextConfig;
