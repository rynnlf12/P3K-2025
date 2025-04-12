'use client';
import dynamic from 'next/dynamic';

const SuksesContent = dynamic(() => import('./SuksesContent'), { ssr: false });

export default function Page() {
  return <SuksesContent />;
}
