import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DriveSync',
    short_name: 'DriveSync',
    description: 'Saját autók és szervizkönyv kezelése',
    start_url: '/',
    display: 'standalone', // Ez tünteti el a böngésző keretet!
    background_color: '#0f172a', // Slate-900 (Sötét háttér betöltéskor)
    theme_color: '#f59e0b', // Amber-500 (A fejléc színe)
    icons: [
      {
        src: '/icon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}