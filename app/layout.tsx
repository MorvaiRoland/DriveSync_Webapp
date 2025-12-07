import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";
// 1. FONTOS: Visszahozzuk a ThemeProvider-t!
// Ha neked máshol van a fájl, írd át az import útvonalat (pl. "@/components/theme-provider")
import { ThemeProvider } from "@/components/theme-provider"; 

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
    // 2. FONTOS: suppressHydrationWarning kell a html tagre a next-themes miatt
    <html lang="hu" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* 3. FONTOS: Itt a hiányzó rész! Visszacsomagoljuk a gyerekeket a Providerbe */}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <RegisterSW />
        </ThemeProvider>

      </body>
    </html>
  );
}