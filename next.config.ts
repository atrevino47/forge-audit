import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
      {
        source: '/audit',
        destination: '/audit/wizard',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: false,
      },
      {
        source: '/checkout',
        destination: '/payments/checkout',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
