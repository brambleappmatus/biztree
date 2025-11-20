import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Disable dev overlay in production
  devIndicators: {
    position: 'bottom-right',
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
