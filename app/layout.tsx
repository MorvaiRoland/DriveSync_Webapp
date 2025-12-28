import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import CookieBanner from '@/components/CookieBanner'
import InstallPrompt from '@/components/InstallPrompt'
import OfflineIndicator from '@/components/OfflineIndicator' 
import PermissionManager from '@/components/PermissionChecker' 

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Ez engedi, hogy a tartalom a Notch alá menjen
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
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png', 
    apple: [
      { url: '/icons/apple-icon.png' },
      { url: '/icons/apple-icon.png', sizes: '512x512' }
    ],
  },
  openGraph: {
    title: 'DynamicSense Technologies',
    description: 'Prémium Garázsmenedzsment AI támogatással. Flotta és szervizkönyv egy helyen.',
    url: 'https://www.dynamicsense.hu',
    siteName: 'DynamicSense',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'DynamicSense Dashboard Preview',
      },
    ],
    locale: 'hu_HU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DynamicSense Technologies',
    description: 'A legmodernebb magyar autós alkalmazás.',
    images: ['/opengraph-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Ez teszi átlátszóvá a felső sávot
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
      <body className="antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen flex flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 w-full max-w-[2000px] mx-auto flex flex-col relative">
            {children}
          </main>
          
          <Toaster position="top-center" richColors closeButton />
          
          <div className="contents">
            <CookieBanner />
            <InstallPrompt />
            <PermissionManager />
            <OfflineIndicator />
            <RegisterSW />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}