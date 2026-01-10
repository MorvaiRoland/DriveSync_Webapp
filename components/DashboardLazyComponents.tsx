// components/DashboardLazyComponents.tsx
'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const LoadingWidget = () => <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />;

// Ezek tisztán Kliens oldali komponensek (Modals, Widgets), ezek maradhatnak itt:
export const ChangelogModal = dynamic(() => import('@/components/ChangelogModal'), { ssr: false });
export const AiMechanic = dynamic(() => import('@/components/AiMechanic'), { ssr: false });
export const CongratulationModal = dynamic(() => import('@/components/CongratulationModal'), { ssr: false });
export const GamificationWidget = dynamic(() => import('@/components/GamificationWidget'), { loading: LoadingWidget });

export const WeatherWidget = dynamic(() => import('@/components/DashboardWidgets').then(m => ({ default: m.WeatherWidget })), { loading: LoadingWidget, ssr: false });

export const FuelWidget = dynamic(() => import('@/components/FuelWidget'), { loading: LoadingWidget, ssr: false });

// MarketplaceSection TÖRÖLVE INNEN - Vissza a page.tsx-be!
// QuickCostOverview maradhat, ha nem használ 'supabase/server'-t, de ha igen, akkor azt is vidd át.
export const QuickCostOverview = dynamic(() => import('@/components/QuickCostOverview'), { loading: LoadingWidget });