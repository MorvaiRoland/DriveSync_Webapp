"use client";

import { ReactNode, Suspense } from 'react';

export function LazySection({ 
  children, 
  fallback = <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}
