'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function NavbarDesktop() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Daftar', href: '/daftar' },
    {
      label: 'Surat Edaran',
      href: 'https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing',
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="hidden md:flex w-full justify-between items-center px-10 py-4 bg-white/90 backdrop-blur-sm border-b border-orange-100 shadow-sm fixed top-0 left-0 z-50"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/desain-p3k.png" alt="Logo P3K" width={140} height={0} className="h-auto object-contain" />
      </Link>

      {/* Menu */}
      <div className="flex gap-6 items-center">
        {navItems.map((item) => (
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative text-orange-800 font-medium hover:text-orange-600 transition`}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`relative font-medium transition duration-300 hover:text-orange-600 ${
                pathname === item.href ? 'text-orange-600' : 'text-orange-800'
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <motion.span
                  layoutId="underline"
                  className="absolute left-0 -bottom-1 w-full h-[2px] bg-orange-500 rounded"
                />
              )}
            </Link>
          )
        ))}
      </div>
    </motion.nav>
  );
}
