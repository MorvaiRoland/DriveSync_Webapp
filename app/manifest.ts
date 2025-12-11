import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DriveSync Hungary',
    short_name: 'DriveSync',
    description: 'Prémium Garázsmenedzsment - Szervizkönyv és költségek kezelése egy helyen.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Sötétkék háttér betöltéskor (a layout.tsx-ben is ez van)
    theme_color: '#0f172a',       // FONTOS: Ez szebbé teszi a telefon státuszbárját (beleolvad az appba)
    orientation: 'portrait',      // Megakadályozza, hogy betöltéskor elforduljon
    id: '/',                      // Egyedi azonosító a PWA követéshez
    
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any', // Ez jelenik meg sima ikonként (pl. Windows tálca)
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // FONTOS! Ez kell Androidra (hogy kitöltse a kört/négyzetet)
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any', // Nagy felbontású ikon egyéb helyekre (pl. telepítési képernyő)
      },
    ],
    
    // Opcionális: Később, ha teszel be képernyőképeket a /public/screenshots mappába, vedd ki a kommentet!
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