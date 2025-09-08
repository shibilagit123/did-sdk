import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

   webpack: (config) => {
    // prevent bundling server-only modules client-side
    config.resolve.fallback = { fs: false, path: false, crypto: false };
    return config;
  },
};

export default nextConfig;
