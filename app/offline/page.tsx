'use client';

import { WifiOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
            <WifiOff className="w-10 h-10 text-slate-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2">No Connection</h1>
        <p className="text-slate-400 mb-8">
          You're currently offline. Some features may not be available. Try to reconnect or view cached content.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Try Reconnecting
          </button>
          
          <Link
            href="/"
            className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
        
        <p className="text-xs text-slate-500 mt-6">
          🚀 DynamicSense will sync your data automatically when you're back online.
        </p>
      </div>
    </div>
  );
}
