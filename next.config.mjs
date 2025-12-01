/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Disable dev overlay in production
    devIndicators: {
        position: 'bottom-right',
    },

    // Production optimizations
    poweredByHeader: false,
    compress: true,

    // Experimental features for Next.js 16
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lcelsprlbglkyigsyodf.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    },

    // Add cache headers for static assets
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
