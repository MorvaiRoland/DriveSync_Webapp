'use client';

import dynamic from 'next/dynamic';

const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false });
const InstallPrompt = dynamic(() => import('@/components/InstallPrompt'), { ssr: false });
const PermissionChecker = dynamic(() => import('@/components/PermissionChecker'), { ssr: false });
const OfflineIndicator = dynamic(() => import('@/components/OfflineIndicator'), { ssr: false });

export default function ClientBoot() {
  return (
    <>
      <InstallPrompt />
      <PermissionChecker />
      <OfflineIndicator />
      <CookieBanner />
    </>
  );
}
