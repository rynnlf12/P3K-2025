// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";

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
      lang="en"
      className={${montserrat.variable} ${geistSans.variable} ${geistMono.variable}}
    >
      <body className="antialiased">
        {children}

        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
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
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.09.532 4.053 1.464 5.774L0 24l6.486-1.684A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm6.26 17.216c-.258.728-1.493 1.427-2.065 1.512-.553.08-1.242.114-3.544-.756-2.975-1.17-4.891-4.08-5.041-4.272-.15-.192-1.204-1.598-1.204-3.048 0-1.45.762-2.167 1.033-2.465.27-.299.587-.374.782-.374.195 0 .391.002.563.01.182.009.427-.069.667.51.258.613.875 2.123.952 2.274.077.15.128.325.025.522-.102.197-.154.32-.3.49-.145.17-.306.378-.437.51-.145.146-.295.304-.127.597.168.293.749 1.238 1.606 2.003 1.103.98 2.033 1.285 2.325 1.43.292.146.46.123.63-.073.17-.195.728-.852.923-1.145.195-.293.39-.243.66-.146.27.097 1.707.803 1.995.95.288.146.48.219.552.342.072.124.072.729-.186 1.456z" />
            </svg>
          </a>

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
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.34 3.608 1.316.975.975 1.253 2.242 1.315 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.34 2.633-1.315 3.608-.975.975-2.242 1.253-3.608 1.315-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.34-3.608-1.315-.975-.975-1.253-2.242-1.315-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.34-2.633 1.315-3.608.975-.975 2.242-1.253 3.608-1.315C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.771.13 4.635.465 3.678 1.422 2.721 2.379 2.386 3.515 2.328 4.796.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.058 1.281.393 2.417 1.35 3.374.957.957 2.093 1.292 3.374 1.35 1.281.058 1.69.072 4.948.072s3.668-.014 4.948-.072c1.281-.058 2.417-.393 3.374-1.35.957-.957 1.292-2.093 1.35-3.374.058-1.281.072-1.69.072-4.948s-.014-3.668-.072-4.948c-.058-1.281-.393-2.417-1.35-3.374-.957-.957-2.093-1.292-3.374-1.35C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
            </svg>
          </a>
        </div>
      </body>
    </html>
  );
}