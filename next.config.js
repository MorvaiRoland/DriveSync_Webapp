/** @type {import('next').NextConfig} */

// 1. CSP Header beállítása (Maradt a te verziód, mert jó)
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
  
  // Mobile optimization & Mapbox
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  compress: true,
  productionBrowserSourceMaps: false, // Fontos: Kikapcsolva a gyorsabb buildért
  
  // Image optimization
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [320, 375, 425, 640],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
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
        ],
      },
    ];
  },
};

// PWA KONFIGURÁCIÓ JAVÍTÁSA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Dev módban ne cache-eljen!
  
  // iOS Stabilitás beállítások:
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // Ezt kapcsold KI, mert iOS-en végtelen újratöltést okozhat

  // *** EZ A RÉSZ HIÁNYZOTT A STABILITÁSHOZ: ***
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true,       // Azonnal telepítse az újat
    clientsClaim: true,      // Azonnal vegye át az irányítást
    cleanupOutdatedCaches: true, // Törölje a régi, beragadt verziókat (EZ A KULCS!)
  },

  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 év
        },
      },
    },
    {
      urlPattern: /^https:\/\/.+\.supabase\.co\/.*/i,
      handler: 'NetworkFirst', // JAVASLAT: API-nál jobb a NetworkFirst, hogy mindig friss adatot kapj
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10, // Ha nincs net 10mp-ig, akkor adja a cache-t
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 nap
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);