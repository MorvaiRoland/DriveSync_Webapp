import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; 
import CookieBanner from '@/components/CookieBanner'

export const viewport: Viewport = {
  themeColor: "#0f172a", // Ez a sötétkék háttérszín, passzoljon az ikon hátteréhez
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://drivesync-hungary.hu'),
  
  title: {
    default: "DriveSync - Prémium Garázsmenedzsment",
    template: "%s | DriveSync"
  },
  description: "A DriveSync Magyarország legmodernebb autós alkalmazása. Kezeld a szerviztörténetet, tankolásokat és költségeket egy helyen.",
  keywords: ["drivesync", "autó nyilvántartás", "szervizkönyv", "tankolás napló", "autó eladás", "garázs menedzsment", "járműelőélet"],
  authors: [{ name: "DriveSync Technologies" }],
  
  // PWA Beállítások
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSync",
  },
  
  // Ikonok (Feltételezve, hogy megcsináltad az új PNG-ket)
  icons: {
    // A favicon a böngészőfülhöz
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-512.png', type: 'image/png' }, // Nagy felbontású ikon
    ],
    // Ez kell az iPhone-nak, hogy szép legyen a főképernyőn
    apple: [
      { url: '/icons/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    // Egyéb shortcut ikonok
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/apple-icon.png',
      },
    ],
  },

  // Social Media & Google Search (EZ KELL A GOOGLE KÉPHEZ)
  openGraph: {
    title: "DriveSync - Az autód digitális garázsa",
    description: "Felejtsd el a papírokat. Kezeld a szervizkönyvet és a költségeket egyetlen prémium felületen.",
    url: "https://drivesync-hungary.hu",
    siteName: "DriveSync Hungary",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: '/icons/opengraph-image.png', // Ezt a fájlt hozd létre 1200x630 méretben!
        width: 1200,
        height: 630,
        alt: 'DriveSync Hungary Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DriveSync - Prémium Garázsmenedzsment",
    description: "Kezeld a szerviztörténetet és költségeket egy helyen.",
    images: ['/icons/opengraph-image.png'], // Ugyanaz a nagy kép mehet ide is
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors closeButton />
            <CookieBanner />
            <RegisterSW />
        </ThemeProvider>

      </body>
    </html>
  );
}