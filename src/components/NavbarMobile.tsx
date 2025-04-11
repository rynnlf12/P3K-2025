"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function NavbarMobile() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Beranda", href: "/" },
    { label: "Daftar", href: "/daftar" },
    {
      label: "Surat Edaran",
      href: "https://drive.google.com/drive/folders/1HAsBXoPitXxJXpGss1smselXrWCHH5Jo?usp=sharing",
      external: true,
    },
  ];

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="md:hidden flex items-center justify-between px-4 py-3 border-b border-orange-300 bg-white shadow fixed top-0 left-0 right-0 z-50"
    >
      <div className="flex items-center gap-2">
        <Image
          src="/desain-p3k.png"
          alt="Logo P3K"
          width={140}
          height={0}
          className="object-contain"
        />
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-orange-800 focus:outline-none"
      >
        {isOpen ? "✕" : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col px-6 py-4 space-y-6"
          >
            {menuItems.map((item) => (
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-800 font-semibold hover:text-orange-600 transition border-b"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-orange-800 font-semibold hover:text-orange-600 transition border-b ${pathname === item.href ? "underline underline-offset-4 text-orange-600" : ""}`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
