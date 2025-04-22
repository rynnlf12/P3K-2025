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
      transition={{ duration: 0.5 }}
      className="hidden md:flex w-full items-center justify-between px-6 py-2 shadow-md bg-white/70 backdrop-blur fixed top-0 left-0 z-50 border-b border-orange-200"
    >
      {/* Logo */}
      <Link href="/">
        <Image
          src="/desain-p3k.png"
          alt="Logo P3K"
          width={150}
          height={0}
          className="object-contain h-auto"
        />
      </Link>

      {/* Navigation Menu */}
      <div className="flex gap-8 text-orange-800 font-semibold">
        {navItems.map((item) => (
          item.external ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`hover:underline underline-offset-4 transition duration-300 ${pathname === item.href ? 'text-orange-600' : ''}`}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={`hover:underline underline-offset-4 transition duration-300 ${pathname === item.href ? 'text-orange-600' : ''}`}
            >
              {item.label}
            </Link>
          )
        ))}
      </div>
    </motion.nav>
  );
}
