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
  
  // Mobile optimization
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Image optimization for mobile
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [320, 375, 425, 640],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
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
  // Mobile optimization
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    {
      urlPattern: /^https:\/\/.+\.supabase\.co\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);