'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Beranda' },
  {
    href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
    label: 'Surat Edaran',
    external: true,
  },
];

export default function NavbarMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Pastikan pathname tidak null sebelum melanjutkan
  if (!pathname || pathname.includes('/admin')) {
    return null; // Jangan tampilkan navbar jika berada di halaman admin atau pathname null
  }
  
  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white backdrop-blur-md px-4 py-2 shadow border-b">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/desain-p3k.png" alt="Logo P3K" width={120} height={0} className="h-auto object-contain" />
        </Link>
        <button onClick={() => setOpen(true)} className="text-orange-800 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Slide-in Side Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 p-6 shadow-xl flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setOpen(false)}
                  className="text-orange-800"
                  aria-label="Tutup menu"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Nav Items */}
              <div className="flex flex-col gap-6 text-lg font-semibold text-orange-800">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setOpen(false)}
                    className={`transition duration-200 ${
                      pathname === item.href ? 'text-orange-600' : 'hover:text-orange-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* CTA Button */}
              <Link
                href="/daftar"
                onClick={() => setOpen(false)}
                className="mt-auto border-2 border-orange-600 text-orange-600 text-center py-2 font-bold uppercase hover:bg-orange-600 hover:text-white transition mt-10"
              >
                DAFTAR SEKARANG
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
