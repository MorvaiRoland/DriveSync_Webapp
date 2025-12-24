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
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" }, // bg-slate-50
    { media: "(prefers-color-scheme: dark)", color: "#020617" },  // bg-slate-950
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // A userScalable: false-t csak akkor hagyd benne, ha nagyon indokolt!
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
    telephone: false, // Megakadályozza, hogy az iOS véletlenszerű számokat linknek nézzen
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
  // ... (többi ikon és OG beállítás változatlan, azok tökéletesek)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body
        className="antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-500 selection:text-white"
        style={{
          minHeight: '100dvh',
          // Padding helyett érdemes lehet a belső tartalomnál kezelni, 
          // de ha globálisan akarod, ez a legbiztosabb módja:
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* A tartalom középre rendezése és max szélesség korlátozása nagy kijelzőkön */}
          <main className="flex-1 flex flex-col w-full max-w-[2000px] mx-auto overflow-x-hidden">
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