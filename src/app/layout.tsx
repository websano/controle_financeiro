import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finanças Libélula - Controle Financeiro",
  description: "Sistema de controle financeiro pessoal com entradas e saídas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Finanças Libélula",
  },
  icons: {
    apple: [
      { url: "/images/icon_app_192.png", sizes: "192x192" },
      { url: "/images/icon_app_512.png", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#043f43",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} antialiased bg-[#043f43] min-h-screen`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

