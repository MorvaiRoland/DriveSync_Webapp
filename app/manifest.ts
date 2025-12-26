import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DynamicSense - Prémium Garázsmenedzsment',
    short_name: 'DynamicSense',
    description: 'Digitális szervizkönyv, költségkövetés és AI diagnosztika autósoknak.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#020617',
    orientation: 'portrait',
    dir: 'ltr',
    lang: 'hu-HU',
    id: 'com.dynamicsense.app',
    
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
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

    screenshots: [
      {
        src: '/screenshots/mobile-dashboard.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow', // Fontos: 'narrow' telefonra
        label: 'DynamicSense Irányítópult',
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide', // Fontos: 'wide' desktopra
        label: 'DynamicSense Webes felület',
      },
    ],

    categories: ['productivity', 'utilities', 'lifestyle'],
    
    shortcuts: [
      {
        name: 'Garázsom',
        short_name: 'Garázs',
        description: 'Autóid megtekintése',
        url: '/',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Statisztikák',
        short_name: 'Költségek',
        description: 'Kiadások elemzése',
        url: '/analytics',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
    
    prefer_related_applications: false,
  }
}