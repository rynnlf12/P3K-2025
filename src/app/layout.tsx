// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

import NavbarMobile from "@/components/NavbarMobile";
import NavbarDesktop from "@/components/NavbarDesktop";
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "P3K 2025",
  description: "Website Pendaftaran P3K 2025",
};

export default function RootLayout({
  
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="antialiased bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 min-h-screen">
        {/* Navbar Global */}
        <NavbarDesktop />
        <NavbarMobile />

        {children}

        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <a
            href="https://wa.me/6285603105234"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
            title="Kontak WhatsApp"
          >
            <FaWhatsapp className="w-6 h-6" />
          </a>

          <a
            href="https://www.instagram.com/ksrpmiunitunsur_/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition"
            title="Instagram"
          >
            <FaInstagram className="w-6 h-6" />
          </a>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
  
}
