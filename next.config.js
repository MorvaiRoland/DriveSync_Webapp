/** @type {import('next').NextConfig} */

// 1. Lépés: Definiáljuk a szigorú CSP-t
// JAVÍTÁS: Hozzáadtuk a 'https://api.mapbox.com'-ot a style-src-hoz
// JAVÍTÁS: Hozzáadtuk a 'worker-src'-t a térkép stabilitásához
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' fonts.googleapis.com https://api.mapbox.com;
    img-src 'self' blob: data: https:;
    font-src 'self' fonts.gstatic.com data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https:;
    worker-src 'self' blob:;
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  poweredByHeader: false,
  
  // Ez a sor kritikus a mobilos "Application error" elkerüléséhez:
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  
  // Performance optimization
  compress: true,
  productionBrowserSourceMaps: false,
  
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui',
      'framer-motion',
    ],
  },
  
  images: {
    remotePatterns: [
      // Supabase képek
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Google profilképek
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      // Minden más külső kép (ha szükséges, különben törölhető a biztonság növeléséhez)
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);