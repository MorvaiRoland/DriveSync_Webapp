/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- A TE EREDETI BEÁLLÍTÁSAID ---
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Supabase és egyéb képek engedélyezése
      },
    ],
  },
  // ----------------------------------
};

// PWA Konfiguráció inicializálása
const withPWA = require('next-pwa')({
  dest: 'public', // Ide generálja a service workert (sw.js)
  register: true, // Automatikus regisztráció
  skipWaiting: true, // Frissítéskor azonnal váltson az új verzióra
  disable: process.env.NODE_ENV === 'development', // Fejlesztés közben NE cache-eljen (zavaró lenne)
});

// A két konfig összefésülése
module.exports = withPWA(nextConfig);