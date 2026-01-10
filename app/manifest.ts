import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // 1. VÁLTOZÁS: Legyen csak a rövid név, így nem lesz duplikáció a címsorban
    name: 'DynamicSense', 
    short_name: 'DynamicSense',
    
    // 2. A szlogen maradjon a leírásban
    description: 'Prémium Garázsmenedzsment - Digitális szervizkönyv és költségkövetés.',
    
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
        src: '/favicon.png', // Ez a korábban mutatott 144x144-es fájlod
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any',
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

    // Screenshots maradhat (vagy kommenteld ki, ha nincs még kép)
    screenshots: [
      {
        src: '/screenshots/mobile-dashboard.png',
        sizes: '1080x1920',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'DynamicSense Irányítópult',
      },
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
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