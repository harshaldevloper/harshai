import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for build
  experimental: {
    turbo: undefined
  }
};

export default nextConfig;
