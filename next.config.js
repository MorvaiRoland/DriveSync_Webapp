/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // Manuális regisztráció a RegisterSW.tsx-ben
  skipWaiting: false, // Megakadályozza a hirtelen verzióváltás okozta összeomlást
  clientsClaim: false,
  disable: process.env.NODE_ENV === 'development',
  
  // KRITIKUS: Kizárjuk a Next.js belső manifest fájljait a cache-ből, 
  // hogy elkerüljük a #418-as hidratációs hibát.
  buildExcludes: [
    /middleware-manifest\.json$/,
    /app-build-manifest\.json$/,
    /\.map$/, // Source map-ek nem kellenek offline
    /^.*src_app_.*\.js$/ // Dinamikus chunkok óvatos kezelése
  ],

  runtimeCaching: [
    {
      // Navigációs kérések (HTML): Mindig a hálózat az első! 
      // Ha nincs net, csak akkor mutatjuk a cache-elt HTML-t.
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3, // 3 mp után vált offline módra
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60, // 24 óra
        },
      },
    },
    {
      // Statikus erőforrások (JS, CSS)
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
      },
    },
    {
      // Külső betűtípusok és Mapbox stílusok
      urlPattern: /^https:\/\/(?:fonts\.googleapis\.com|api\.mapbox\.com)\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'external-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 nap
        },
      },
    },
  ],
});

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
    formats: ['image/webp', 'image/avif'], // AVIF is támogatott a kisebb méretért
    minimumCacheTTL: 604800, // 1 hét gyorsítótárazás
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**' }
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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        // A Service Worker fájlt szigorúan tilos cache-elni a böngészőnek!
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Content-Type', value: 'application/javascript' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);