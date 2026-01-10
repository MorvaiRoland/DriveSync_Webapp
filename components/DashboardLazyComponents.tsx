// components/DashboardLazyComponents.tsx
'use client'; // EZ A KULCS! Ez teszi lehetővé az ssr: false használatát

import dynamic from 'next/dynamic';
import React from 'react';

// A Skeleton loading komponens
const LoadingWidget = () => <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;

// Itt definiáljuk a lazy load komponenseket
export const ChangelogModal = dynamic(() => import('@/components/ChangelogModal'), { ssr: false });
export const AiMechanic = dynamic(() => import('@/components/AiMechanic'), { ssr: false });
export const CongratulationModal = dynamic(() => import('@/components/CongratulationModal'), { ssr: false });
export const GamificationWidget = dynamic(() => import('@/components/GamificationWidget'), { loading: LoadingWidget });

// A WeatherWidget trükkös importja
export const WeatherWidget = dynamic(() => import('@/components/DashboardWidgets').then(m => ({ default: m.WeatherWidget })), { loading: LoadingWidget, ssr: false });

export const FuelWidget = dynamic(() => import('@/components/FuelWidget'), { loading: LoadingWidget, ssr: false });
export const MarketplaceSection = dynamic(() => import('@/components/MarketplaceSection'), { loading: LoadingWidget });
export const QuickCostOverview = dynamic(() => import('@/components/QuickCostOverview'), { loading: LoadingWidget });