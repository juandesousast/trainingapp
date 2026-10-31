import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Hoplita OS · Dark Kinetic Training",
  description: "Plataforma Mobile-First de entrenamiento de fuerza de alta intensidad BIIO",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hoplita OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#09090B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="hoplita" className="dark">
      <body className="min-h-screen w-full bg-zinc-950 text-white overflow-y-auto overflow-x-hidden antialiased selection:bg-[#CCFF00] selection:text-black">
        <Header />
        <main className="min-h-screen w-full flex flex-col pb-32">{children}</main>
      </body>
    </html>
  );
}
