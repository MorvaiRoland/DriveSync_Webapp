import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
import { ThemeProvider } from "@/components/theme-provider";
// 1. ÚJ: Importáljuk a Toaster-t a sonner-ből
import { Toaster } from "sonner"; 

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DriveSync",
  description: "Járműnyilvántartó alkalmazás",
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
            
            {/* 2. ÚJ: Itt helyezzük el a Toaster-t, hogy megjelenjenek az üzenetek */}
            {/* A richColors szebb színeket ad, a position pedig fentre teszi */}
            <Toaster position="top-center" richColors closeButton />
            
            <RegisterSW />
        </ThemeProvider>

      </body>
    </html>
  );
}