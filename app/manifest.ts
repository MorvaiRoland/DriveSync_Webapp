import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // ITT VOLT A HIBA: "DynamicSense Hungary" volt
    name: 'DynamicSense Technologies', 
    
    // A rövid név maradhat DynamicSense (ez jelenik meg az ikon alatt a telefonon)
    short_name: 'DynamicSense',
    
    description: 'Prémium Garázsmenedzsment - Szervizkönyv és költségek kezelése egy helyen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    id: '/',
    
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}