'use client';

import dynamic from 'next/dynamic';

const SuksesContent = dynamic(() => import('src/components/SuksesContent'), { ssr: false });

export default function Page() {
  return <SuksesContent />;
}
