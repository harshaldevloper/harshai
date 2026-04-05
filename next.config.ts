import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for build
  experimental: {
    turbo: undefined
  },
  // Skip TypeScript checking during build (we check locally)
  typescript: {
    ignoreBuildErrors: true
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
