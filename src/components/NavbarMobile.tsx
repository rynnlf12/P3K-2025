'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NavbarMobile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Navbar Top */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur border-b border-orange-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Image src="/desain-p3k.png" alt="Logo P3K" width={140} height={0} className="object-contain" />
          <span className="text-orange-700 font-bold text-lg">P3K 2025</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-orange-700 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex">
          <div className="w-64 bg-white h-full shadow-lg p-6 flex flex-col gap-4 relative">
            <button
              className="absolute top-3 right-4 text-gray-600 text-xl"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mt-6">
              <Image src="/desain-p3k.png" alt="Logo P3K" width={120} height={0} className="object-contain" />
              <span className="font-bold text-orange-700 text-lg">P3K 2025</span>
            </div>

            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="text-orange-800 font-semibold hover:text-orange-600 transition"
            >
              Beranda
            </Link>
            <Link
              href="/daftar"
              onClick={() => setSidebarOpen(false)}
              className="text-orange-800 font-semibold hover:text-orange-600 transition"
            >
              Daftar
            </Link>
            <a
              href="https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-800 font-semibold hover:text-orange-600 transition"
            >
              Surat Edaran
            </a>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </>
  );
}
