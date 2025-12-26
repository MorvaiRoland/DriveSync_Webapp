/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,

  skipWaiting: true,
  clientsClaim: true,

  disable: process.env.NODE_ENV === 'development',

  // 🔥 EZ HIÁNYZOTT – START-URL TELJES KIKAPCSOLÁSA
  navigateFallback: null,
  navigateFallbackDenylist: [/.*/],

  // (ez maradhat, de önmagában kevés)
  cacheStartUrl: false,

  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /index\.html$/, // ❗ KRITIKUS
    /\.map$/,
  ],

  runtimeCaching: [
    {
      // 🚫 App Router navigáció SOHA nem cache-elhető
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
    {
      urlPattern: /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|api\.mapbox\.com)\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-assets',
      },
    },
  ],
});


/* -------------------------------------------------------------------------- */
/*                               SECURITY HEADERS                             */
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
/*                                 NEXT CONFIG                                */
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
        // ❗ sw.js SOHA nem cache-elhető
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
