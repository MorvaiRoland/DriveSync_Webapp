/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Ez tünteti el a "Server Leaks Information" hibát (X-Powered-By)
  poweredByHeader: false,
  
  // Megtartjuk a te eredeti beállításaidat
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
      },
    ],
  },

  // 2. Itt adjuk hozzá a ZAP által hiányolt biztonsági fejléceket
  async headers() {
    return [
      {
        // Minden útvonalra érvényes legyen a védelem
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Megakadályozza, hogy mások iframe-be rakják az oldalad (Clickjacking védelem)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Megakadályozza, hogy a böngésző "tippelje" a fájltípust
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload', // Kényszeríti a HTTPS-t (HSTS hiba javítása)
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block', // Extra védelem Cross-Site Scripting ellen
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Adatvédelmi beállítás (hogy ne küldjön túl sok infót más oldalaknak)
          },
          // 3. Content Security Policy (CSP)
          // Mivel a "hostname: '**'" beállítást használod képeknél, itt a "img-src"-nél engedélyeznünk kell a "https:"-t
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com data:;", 
          },
        ],
      },
    ]
  },
};

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);