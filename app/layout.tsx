import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import CookieBanner from '@/components/CookieBanner'
import InstallPrompt from '@/components/InstallPrompt'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator' 

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dynamicsense.hu'),
  title: {
    default: "DynamicSense Technologies - Prémium Garázsmenedzsment",
    template: "%s | DynamicSense Technologies"
  },
  description: "A DynamicSense Magyarország legmodernebb autós alkalmazása. Kezeld a szerviztörténetet, tankolásokat és költségeket egy helyen.",
  keywords: ["DynamicSense", "autó nyilvántartás", "szervizkönyv", "tankolás napló", "autó eladás", "garázs menedzsment", "járműelőélet"],
  authors: [{ name: "DynamicSense Technologies" }],
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DynamicSense",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body
        // JAVÍTÁS: overflow-x-hidden csak itt legyen, a body-n!
        className="antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-500 selection:text-white"
        style={{
          minHeight: '100dvh',
          // A biztonságos zónákat CSS változóként is átadhatjuk, de a padding itt is maradhat, 
          // ha a design megkívánja. PWA-nál ez segít elkerülni, hogy a tartalom a "notch" alá kerüljön.
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* JAVÍTÁS: Innen kivettük az overflow-x-hidden-t. 
              Ez a konténer csak a szélességet és középre igazítást kezeli. */}
          <main className="flex-1 w-full max-w-[2000px] mx-auto flex flex-col relative">
            {children}
          </main>
          
          <Toaster position="top-center" richColors closeButton />
          <CookieBanner />
          <InstallPrompt />
          <PWAInstallPrompt />
          <OfflineIndicator />
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}