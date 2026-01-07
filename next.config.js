/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development',

  // PWA Loop védelem és App Router optimalizáció
  cacheStartUrl: false,
  dynamicStartUrl: false,
  navigateFallback: null,
  navigateFallbackDenylist: [/.*/],

  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /index\.html$/,
    /\.map$/,
  ],

  runtimeCaching: [
    {
      // Navigáció: Mindig hálózatról, hogy ne legyen beragadt régi verzió (Loop-fix)
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
    },
    {
      // Statikus assetek (JS, CSS)
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Képek optimalizált cache-elése
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // API és Supabase hívások
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 30, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    {
      // Külső betűtípusok és Mapbox
      urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.mapbox\.com)\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-assets',
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 24 * 60 * 60 },
      },
    },
  ],
});

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

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  // Mapbox és nehéz libek kényszerített transpile-olása
  transpilePackages: ['react-map-gl', 'mapbox-gl'],

  images: {
    formats: ['image/avif', 'image/webp'], // AVIF az elsődleges, mert kisebb és szebb
    minimumCacheTTL: 604800, // 1 hét másodpercekben
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
  },

  experimental: {
    // 🔥 REACT COMPILER: Automatikus useMemo/useCallback
    reactCompiler: true,

    // 🔥 PARTIAL PRERENDERING (PPR): A legfontosabb sebességfaktor.
    // A statikus váz azonnal betölt, a dinamikus Supabase adatok pedig "beúsznak".
    ppr: 'incremental',

    // Csomagok, amikből csak a használt részeket fordítjuk be (kisebb bundle)
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'framer-motion',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge'
    ],
    
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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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