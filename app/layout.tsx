import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW"; // FONTOS: Ezt hoztuk létre az előbb!

// 1. VIEWPORT BEÁLLÍTÁSOK (Mobilra optimalizálás)
export const viewport: Viewport = {
  themeColor: "#0f172a", // A státuszsor színe
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Megakadályozza a véletlen nagyítást
  userScalable: false, // Letiltja a kétujjas nagyítást (appos érzés)
};

// 2. METADATA BEÁLLÍTÁSOK (PWA és iOS)
export const metadata: Metadata = {
  title: "DriveSync",
  description: "Járműnyilvántartó alkalmazás",
  manifest: "/manifest.webmanifest",
  
  // ITT A LÉNYEG: Kézzel megmondjuk, hol vannak a képek.
  // Győződj meg róla, hogy a public/icons mappában TÉNYLEG ezek a nevek vannak!
  icons: {
    icon: [
      { url: '/icons/drivesync-logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/drivesync-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon.png' }, // Az iPhone ezt fogja használni főképernyő ikonnak
    ],
  },

  // iOS specifikus beállítások (Hogy eltűnjön a címsor)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveSync",
  },
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
        
        {/* Ez indítja el a Service Workert az offline működéshez */}
        <RegisterSW /> 
      </body>
    </html>
  );
}