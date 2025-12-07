import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DriveSync',
    short_name: 'DriveSync',
    description: 'Saját autók és szervizkönyv kezelése',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#f59e0b',
    orientation: 'portrait', // Megakadályozza, hogy betöltéskor elforduljon
    id: '/', // Egyedi azonosító a PWA követéshez
    
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any', // Ez a "sima" ikon (pl. iOS, Windows)
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // FONTOS! Ez kell Androidra (hogy kitöltse a kört/négyzetet)
      },
    ],
    
    // Opcionális: Ha szeretnéd, hogy a telepítéskor látványos "Store-szerű" előnézet legyen
    // Ehhez képernyőképeket kell tenned a /public mappába
    /*
    screenshots: [
      {
        src: '/screenshots/mobile-1.png',
        sizes: '1080x1920',
        type: 'image/png',
      },
      {
        src: '/screenshots/desktop-1.png',
        sizes: '1920x1080',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    */
  }
}