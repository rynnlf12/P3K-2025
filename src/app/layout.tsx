// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

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
        {children}

        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          {/* WhatsApp */}
          <a
            href="https://wa.me/6282219244749"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
            title="Kontak WhatsApp"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 448 512"
              fill="currentColor"
            >
              <path d="M380.9 97.1C339.3 55.5 283.3 32 224.1 32 100.3 32 .1 132.3 0 256c-.1 45.3 11.7 89.5 33.9 128.2L0 480l99.4-32.7c36.4 19.9 77.3 30.4 118.6 30.3h.1c123.7 0 224-100.3 224-224 0-59.2-23.5-115.2-66.1-157.5zM224.1 438.6c-34.4 0-68.3-9.3-97.6-27l-6.9-4.1-59 19.4 19.7-57.5-4.5-7.1c-20.3-32-31-68.6-31-106.3 .1-105.9 86.1-192 192.1-192 51.3 0 99.5 20 135.8 56.3S416 204.7 416 256c0 105.9-86.1 192.6-191.9 192.6zm101.4-138.8c-5.5-2.8-32.6-16.1-37.7-17.9-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 17.9-17.6 21.6c-3.2 3.7-6.5 4.2-12 1.4-32.5-16.2-53.8-28.9-75.3-65.3-5.7-9.8 5.7-9.1 16.2-30.2 1.8-3.7.9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.2 59.8 95.1 83.9 13.3 5.7 23.6 9.1 31.6 11.6 13.3 4.2 25.4 3.6 35.1 2.2 10.7-1.6 32.6-13.3 37.2-26.2 4.6-13 4.6-24.1 3.2-26.3-1.3-2.2-5-3.6-10.5-6.5z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/ksrpmiunitunsur_/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 transition"
            title="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 448 512"
              fill="currentColor"
            >
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 190.7c-41.9 0-75.8-33.9-75.8-75.8S182.2 180.1 224.1 180.1 299.9 214 299.9 255.9 266 331.7 224.1 331.7zm146.4-194.3c0 14.9-12 26.9-26.9 26.9s-26.9-12-26.9-26.9 12-26.9 26.9-26.9 26.9 12 26.9 26.9zm76.1 27.2c-.9-19.6-5-37-18.2-50.1S368.6 32 349 31.1c-19.5-.9-77.8-1.1-124.9-1.1s-105.4.2-124.9 1.1c-19.6.9-37 5-50.1 18.2S32 79.4 31.1 99c-.9 19.5-1.1 77.8-1.1 124.9s.2 105.4 1.1 124.9c.9 19.6 5 37 18.2 50.1s30.5 17.3 50.1 18.2c19.5.9 77.8 1.1 124.9 1.1s105.4-.2 124.9-1.1c19.6-.9 37-5 50.1-18.2s17.3-30.5 18.2-50.1c.9-19.5 1.1-77.8 1.1-124.9s-.2-105.4-1.1-124.9zM398.8 388c-7.8 19.6-22.9 34.7-42.5 42.5-29.4 11.7-99.2 9-132.2 9s-102.7 2.6-132.2-9c-19.6-7.8-34.7-22.9-42.5-42.5-11.7-29.4-9-99.2-9-132.2s-2.6-102.7 9-132.2c7.8-19.6 22.9-34.7 42.5-42.5 29.4-11.7 99.2-9 132.2-9s102.7-2.6 132.2 9c19.6 7.8 34.7 22.9 42.5 42.5 11.7 29.4 9 99.2 9 132.2s2.6 102.7-9 132.2z" />
            </svg>
          </a>
        </div>
      </body>
    </html>
  );
}
