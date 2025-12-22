"use client";

import React from 'react';

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6 animate-pulse">
      <div>
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-3"></div>
        <div className="h-10 w-64 bg-slate-300 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="w-full lg:w-auto bg-slate-200 dark:bg-slate-800 rounded-2xl h-24"></div>
    </div>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden h-96 animate-pulse">
      <div className="h-60 bg-slate-300 dark:bg-slate-700"></div>
      <div className="p-6 space-y-4">
        <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function MileageWidgetSkeleton() {
  return (
    <div className="rounded-3xl bg-slate-200 dark:bg-slate-800 p-6 sm:p-8 h-48 animate-pulse">
      <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-2/3"></div>
    </div>
  );
}

export function RemindersSkeleton() {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl p-6 animate-pulse">
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse">
      <div className="h-6 bg-slate-300 dark:bg-slate-700 rounded w-1/4 m-6 mb-4"></div>
      <div className="space-y-2 px-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-300 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}
