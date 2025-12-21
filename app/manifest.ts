import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DynamicSense - Premium Vehicle Management',
    short_name: 'DynamicSense',
    description: 'Comprehensive vehicle management with service history, costs, and AI diagnostics.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    orientation: 'portrait-primary',
    dir: 'ltr',
    lang: 'hu-HU',
    id: 'com.dynamicsense.app',

    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
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
        src: '/DynamicSense-logo.png',
        sizes: '540x720',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'DynamicSense Dashboard',
      },
      {
        src: '/DynamicSense-logo.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'DynamicSense Dashboard',
      },
    ],

    categories: ['productivity', 'utilities'],
    shortcuts: [
      {
        name: 'Garage',
        short_name: 'Garage',
        description: 'Access your vehicle garage',
        url: '/',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Analytics',
        short_name: 'Analytics',
        description: 'View vehicle analytics and costs',
        url: '/analytics',
        icons: [
          {
            src: '/icon.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],

    prefer_related_applications: false,
  }
}
