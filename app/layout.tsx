import type { Metadata, Viewport } from "next";
import "./globals.css";

// 1. VIEWPORT BEÁLLÍTÁSOK (Mobilra optimalizálás)
export const viewport: Viewport = {
  themeColor: "#0f172a", // A státuszsor színe (egyező a manifest backgrounddal)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Megakadályozza, hogy belezoomoljon input mezőknél
  userScalable: false, // Letiltja a kétujjas nagyítást (appos érzés)
};

// 2. METADATA BEÁLLÍTÁSOK (PWA és iOS)
export const metadata: Metadata = {
  title: "DriveSync",
  description: "Járműnyilvántartó alkalmazás",
  manifest: "/manifest.webmanifest", // Ez köti be a manifest fájlt!
  
  // iOS specifikus beállítások
  appleWebApp: {
    capable: true, // Ez mondja meg a Safarinak, hogy "lehetek app"
    statusBarStyle: "black-translucent", // Átlátszó státuszsor
    title: "DriveSync", // Az ikon alatti név
    // startupImage: [], // Itt lehetne splash screen-t is megadni később
  },
  
  // Ha nem használnád az app/apple-icon.png automatikát, itt is megadhatod:
  /*
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png", // Apple Touch Icon
  },
  */
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body className="antialiased bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  );
}