import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// Ez állítja be, hogy hogyan jelenjen meg a böngészőben/mobilon
export const metadata: Metadata = {
  title: 'DriveSync',
  description: 'Professzionális autókezelő rendszer saját célra.',
  manifest: '/manifest.webmanifest', // Hivatkozás a manifestre
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png', // iOS ikon
  },
  // Apple specifikus beállítások, hogy szép legyen iPhone-on
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DriveSync',
  },
}

// Ez állítja be a mobil nézet viselkedését (tiltja a nagyítást, színezi a keretet)
export const viewport: Viewport = {
  themeColor: '#0f172a', // A címsor színe mobilon
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Eztől lesz "appos" érzése, nem lehet csiptetve nagyítani
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body className={`${inter.className} bg-slate-50`}>{children}</body>
    </html>
  )
}