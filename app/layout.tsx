import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; 

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// FONTOS: Ez segít a Next.js-nek a relatív linkek (pl. képek) helyes feloldásában
export const metadataBase = new URL('https://drivesync-hungary.hu');

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "DriveSync - Prémium Garázsmenedzsment",
    template: "%s | DriveSync"
  },
  description: "A DriveSync Magyarország legmodernebb autós alkalmazása. Kezeld a szerviztörténetet, tankolásokat és költségeket egy helyen. Digitális szervizkönyv, automata értesítések és kereskedői adatlap generálás.",
  keywords: ["drivesync", "autó nyilvántartás", "szervizkönyv", "tankolás napló", "autó eladás", "garázs menedzsment", "járműelőélet"],
  authors: [{ name: "DriveSync Technologies" }],
  
  // --- PWA Beállítások (Megmaradtak) ---
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSync",
  },
  icons: {
    icon: [
      { url: '/icons/drivesync-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/drivesync-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon.png', sizes: '512x512', type: 'image.png' },
    ],
  },

  // --- Social Media Megosztás (Facebook, LinkedIn, Discord stb. ezt látja) ---
  openGraph: {
    title: "DriveSync - Az autód digitális garázsa",
    description: "Felejtsd el a papírokat. Kezeld a szervizkönyvet és a költségeket egyetlen prémium felületen.",
    url: "https://drivesync-hungary.hu",
    siteName: "DriveSync Hungary",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: '/icons/drivesync-logo.png', // A logót használjuk előnézeti képnek
        width: 512,
        height: 512,
        alt: 'DriveSync Hungary Logo',
      },
    ],
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
            
            {/* Értesítések megjelenítése */}
            <Toaster position="top-center" richColors closeButton />
            
            {/* Service Worker regisztráció (PWA) */}
            <RegisterSW />
        </ThemeProvider>

      </body>
    </html>
  );
}