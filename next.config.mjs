/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/storage/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/storage/**',
            },
            {
                protocol: 'https',
                hostname: 'api.ngwindsongk.com',
                pathname: '/storage/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self' 'unsafe-inline' http://localhost:8000 http://127.0.0.1:8000 https://api.ngwindsongk.com; img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 https://api.ngwindsongk.com https://encrypted-tbn0.gstatic.com https://images.unsplash.com https://unpkg.com; font-src 'self' data:;",
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
