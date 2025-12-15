/** @type {import('next').NextConfig} */

// 1. Lépés: Definiáljuk a szigorú CSP-t egy változóban, hogy átlátható legyen
// A "frame-ancestors 'none'" javítja a ClickJacking hibát.
// Az "object-src 'none'" és "base-uri 'self'" javítja a "No Fallback" hibát.
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' fonts.gstatic.com data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'self' https:;
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim(); // Kiveszi a felesleges szóközöket/sortöréseket

const nextConfig = {
  
  poweredByHeader: false,
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
  
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Ez kezeli a Google profilképeket
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // --- Biztonsági Fejlécek ---
          {
            key: 'Content-Security-Policy',
            value: cspHeader, // Itt adjuk át a fenti szigorú szabályokat
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Régi böngészőknek (ClickJacking védelem 1. szint)
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
          // --- CORS Beállítások (CORS Misconfiguration hiba javítása) ---
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Vagy a saját domain-ed, ha szigorúbb akarsz lenni (pl. https://dynamicsense.hu)
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

