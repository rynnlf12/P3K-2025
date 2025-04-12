'use client';

import dynamic from 'next/dynamic';

// Hanya muat komponen ini di client-side (html2pdf butuh window/self)
const SuksesContent = dynamic(() => import('./SuksesContent'), { ssr: false });

export default function Page() {
  return <SuksesContent />;
}
