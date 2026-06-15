/** @type {import('next').NextConfig} */
const nextConfig = {
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
                        value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:8000 http://127.0.0.1:8000 https://api.ngwindsongk.com; img-src 'self' data: blob: https://encrypted-tbn0.gstatic.com https://images.unsplash.com https://unpkg.com; font-src 'self' data:;",
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
