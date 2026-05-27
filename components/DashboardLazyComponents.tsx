// components/DashboardLazyComponents.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const LoadingWidget = () => <div className="h-32 w-full bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />;

export const ChangelogModal = dynamic(() => import('@/components/ChangelogModal'), { ssr: false });
export const AiMechanic = dynamic(() => import('@/components/AiMechanic'), { ssr: false });
export const CongratulationModal = dynamic(() => import('@/components/CongratulationModal'), { ssr: false });
export const GamificationWidget = dynamic(() => import('@/components/GamificationWidget'), { loading: LoadingWidget });

// WeatherWidget & FuelWidget – from unified DashboardWidgets (glass/light-dark ready)
export const WeatherWidget = dynamic(
  () => import('@/components/DashboardWidgets').then(m => ({ default: m.WeatherWidget })),
  { loading: LoadingWidget, ssr: false }
);

export const FuelWidget = dynamic(
  () => import('@/components/DashboardWidgets').then(m => ({ default: m.FuelWidget })),
  { loading: LoadingWidget, ssr: false }
);

export const QuickCostOverview = dynamic(() => import('@/components/QuickCostOverview'), { loading: LoadingWidget });