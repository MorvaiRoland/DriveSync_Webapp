/** @type {import('next').NextConfig} */

// CSP Header optimalizálva
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
  reactStrictMode: true, // Segít a hibák kiszűrésében
  
  // Mobile & Mapbox
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  compress: true,
  
  // Image optimization - MAXIMÁLIS SEBESSÉG
  images: {
    formats: ['image/webp', 'image/avif'], // AVIF hozzáadva a kisebb méretért
    minimumCacheTTL: 604800, // 60 mp helyett 1 HÉT (fontos a gyorsasághoz!)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Szabványosabb méretek
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'], // Tree-shaking optimalizálás
    serverActions: {
      bodySizeLimit: '10mb', // 20mb túlzás lehet, lassíthat
    },
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

// PWA KONFIGURÁCIÓ - JAVÍTOTT
const withPWA = require('next-pwa')({
  dest: 'public',
  // FONTOS: Kikapcsoljuk az automatikus regisztrációt, mert a RegisterSW.tsx kezeli!
  register: false, 
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Cache stratégia
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-font-assets' },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);