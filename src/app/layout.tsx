import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "VECTOR · Performance & Nutrition OS",
  description: "Sistema de sobrecarga progresiva BIIO y nutrición deportiva de alta precisión.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
      { url: "/icon-192.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VECTOR OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090B",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="vector" className="dark">
      <body className="min-h-screen w-full bg-zinc-950 text-white overflow-y-auto overflow-x-hidden antialiased selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <main className="min-h-screen w-full flex flex-col pb-32">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
