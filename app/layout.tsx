import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; 
import CookieBanner from '@/components/CookieBanner'

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // FONTOS: Ez kell, hogy a '/icons/...' útvonalak teljes URL-ek legyenek (pl. https://drivesync-hungary.hu/icons/...)
  metadataBase: new URL('https://drivesync-hungary.hu'),
  
  title: {
    default: "DriveSync - Prémium Garázsmenedzsment",
    template: "%s | DriveSync"
  },
  description: "A DriveSync Magyarország legmodernebb autós alkalmazása. Kezeld a szerviztörténetet, tankolásokat és költségeket egy helyen.",
  keywords: ["drivesync", "autó nyilvántartás", "szervizkönyv", "tankolás napló", "autó eladás", "garázs menedzsment", "járműelőélet"],
  authors: [{ name: "DriveSync Technologies" }],
  
  manifest: "/manifest.webmanifest",
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSync",
  },
  
  icons: {
    // A favicon.ico-t mindig a gyökérbe keresik a böngészők, ne tedd az icons mappába, hagyd a public mappában!
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-512.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  openGraph: {
    title: "DriveSync - Az autód digitális garázsa",
    description: "Felejtsd el a papírokat. Kezeld a szervizkönyvet és a költségeket egyetlen prémium felületen.",
    url: "https://drivesync-hungary.hu",
    siteName: "DriveSync Hungary",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: '/icons/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'DriveSync Hungary Dashboard Preview',
      },
    ],
  },
  
  // Twitter kártya beállítások
  twitter: {
    card: 'summary_large_image',
    title: "DriveSync - Prémium Garázsmenedzsment",
    description: "Kezeld a szerviztörténetet és költségeket egy helyen.",
    images: ['/icons/opengraph-image.png'],
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