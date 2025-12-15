import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner"; 
import CookieBanner from '@/components/CookieBanner'
import InstallPrompt from '@/components/InstallPrompt'
import 'mapbox-gl/dist/mapbox-gl.css' 

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dynamicsense.hu'),
  
  // ITT A JAVÍTÁS:
  title: {
    // Ez a szöveg jelenik meg a főoldalon (pontosan amit kértél):
    default: "DynamicSense Technologies - Prémium Garázsmenedzsment",
    // Ez pedig az aloldalakon (pl. "Profil | DynamicSense..."):
    template: "%s | DynamicSense Technologies - Prémium Garázsmenedzsment"
  },
  
  description: "A DynamicSense Magyarország legmodernebb autós alkalmazása. Kezeld a szerviztörténetet, tankolásokat és költségeket egy helyen.",
  keywords: ["DynamicSense", "autó nyilvántartás", "szervizkönyv", "tankolás napló", "autó eladás", "garázs menedzsment", "járműelőélet"],
  authors: [{ name: "DynamicSense Technologies" }],
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.webmanifest",
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DynamicSense",
  },
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-512.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  openGraph: {
    title: "DynamicSense Technologies - Prémium Garázsmenedzsment",
    description: "Felejtsd el a papírokat. Kezeld a szervizkönyvet és a költségeket egyetlen prémium felületen.",
    url: "https://dynamicsense.hu",
    siteName: "DynamicSense Technologies",
    locale: "hu_HU",
    type: "website",
    images: [
      {
        url: '/icons/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'DynamicSense Dashboard',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: "DynamicSense Technologies - Prémium Garázsmenedzsment",
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
            <InstallPrompt />
            <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}