import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DynamicSense - Prémium Garázsmenedzsment',
    short_name: 'DynamicSense',
    description: 'Digitális szervizkönyv, költségkövetés és AI diagnosztika autósoknak.',
    
    // 🔹 Start URL standalone módban, SW nem cache-eli
    start_url: '/?mode=standalone',
    scope: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'portrait',
    dir: 'ltr',
    lang: 'hu-HU',
    id: 'com.dynamicsense.app',

    // 🔹 Ikonok, csak egy any + egy maskable változat
    icons: [
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],

    // 🔹 Screenshot-ok
    screenshots: [
      {
        src: '/screenshots/mobile-dashboard.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow', // Telefon
        label: 'DynamicSense Irányítópult',
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide', // Desktop
        label: 'DynamicSense Webes felület',
      },
    ],

    categories: ['productivity', 'utilities', 'lifestyle'],

    // 🔹 Shortcut-ok, start_url-hoz igazítva, hogy SW ne cache-elje
    shortcuts: [
      {
        name: 'Garázsom',
        short_name: 'Garázs',
        description: 'Autóid megtekintése',
        url: '/?mode=standalone', // fontos a start_url összhangja
        icons: [{ src: '/icons/icon-512.png', sizes: '512x512' }],
      },
      {
        name: 'Statisztikák',
        short_name: 'Költségek',
        description: 'Kiadások elemzése',
        url: '/analytics',
        icons: [{ src: '/icons/icon-512.png', sizes: '512x512' }],
      },
    ],

    prefer_related_applications: false,
  }
}
