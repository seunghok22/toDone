"use client";

import dynamic from 'next/dynamic';

const MobileAppClient = dynamic(() => import('./ClientComponent'), { ssr: false });

export default function MobileAppPage() {
  return <MobileAppClient />;
}
