/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // Érdemes true-ra tenni, hogy a Next kezelje a regisztrációt
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development',

  // 🔥 EZEK A KRITIKUS BEÁLLÍTÁSOK A LOOP ELLEN:
  cacheStartUrl: false,
  dynamicStartUrl: false, // EZ KELL NEKED! Ez tiltja le a "/" kényszerített cache-elését.
  
  navigateFallback: null, // App Routernél nem lehet fallback HTML
  navigateFallbackDenylist: [/.*/], // Minden navigációt átengedünk a hálózatnak

  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /index\.html$/,
    /\.map$/,
  ],

  runtimeCaching: [
    // 1. NAVIGÁCIÓ JAVÍTÁSA:
    // Minden oldalbetöltés (HTML kérés) kizárólag a hálózatról jöhet.
    // Ez szünteti meg a fehér képernyőt és a loopot.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst', 
    },
    // 2. Statikus JS/CSS fájlok (ezek mehetnek cache-be nyugodtan)
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 nap
        },
      },
    },
    // 3. Képek cache-elése (Next Image optimalizált képek is)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
    // 4. API hívások és szerver oldali kérések (NetworkFirst a biztonság kedvéért)
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
    // 5. Külső Fontok és Mapbox
    {
      urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.mapbox\.com)\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-assets',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60,
        },
      },
    },
  ],
});

/* -------------------------------------------------------------------------- */
/* SECURITY HEADERS                              */
/* -------------------------------------------------------------------------- */

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' https:;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

/* -------------------------------------------------------------------------- */
/* NEXT CONFIG                                 */
/* -------------------------------------------------------------------------- */

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
    serverActions: {
      bodySizeLimit: '10mb',
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);