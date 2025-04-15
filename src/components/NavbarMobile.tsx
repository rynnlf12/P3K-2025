'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/daftar', label: 'Daftar' },
  {
    href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
    label: 'Surat Edaran',
    external: true,
  },
];

export default function NavbarMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="md:hidden fixed top-0 left-0 w-full z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2 shadow border-b">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/desain-p3k.png" alt="Logo P3K" width={120} height={0} className="h-auto object-contain" />
        </Link>
        <button onClick={() => setOpen(true)} className="text-orange-800 focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
          >
            {/* Tombol close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-orange-800"
              aria-label="Tutup menu"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Menu items */}
            <div className="flex flex-col items-center gap-6 text-lg font-semibold">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  className={`transition duration-200 ${
                    pathname === item.href ? 'text-orange-600' : 'text-orange-800 hover:text-orange-600'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
