/** @type {import('next').NextConfig} */

// 1. CSP Header
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
  reactStrictMode: true,
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  compress: true,
  
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 604800, // 1 hét
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**' }
    ],
  },
  
  experimental: {
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
    ];
  },
};

// --- PWA BEÁLLÍTÁS (A JAVÍTÁS LÉNYEGE) ---
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // Kézzel regisztráljuk a RegisterSW.tsx-ben
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // Fontos: ezeket a fájlokat NE cache-elje, mert bezavarják a Next.js működését
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],

  runtimeCaching: [
    // 1. SZABÁLY: NAVIGÁCIÓ (HTML) - MINDIG HÁLÓZAT ELŐSZÖR!
    // Ez javítja meg a "beragadást". Ha van net, onnan tölti, ha nincs, csak akkor a cache-ből.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 1, 
          maxAgeSeconds: 24 * 60 * 60, // 24 óra
        },
        networkTimeoutSeconds: 3, // Ha 3 mp alatt nem jön válasz a szervertől, akkor nyúl a cache-hez
      },
    },
    // 2. SZABÁLY: API HÍVÁSOK (Supabase, Next API)
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api') || url.hostname.includes('supabase'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 perc
        },
      },
    },
    // 3. SZABÁLY: KÉPEK (MEHET CACHE-BŐL AGRESSZÍVAN)
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 1 hónap
        },
      },
    },
    // 4. SZABÁLY: JS és CSS FÁJLOK
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);