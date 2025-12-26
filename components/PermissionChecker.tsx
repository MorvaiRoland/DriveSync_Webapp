'use client';

import { useState, useEffect } from 'react';
import { MapPin, Bell, X, Info } from 'lucide-react';

export default function PermissionManager() {
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsNotifications, setNeedsNotifications] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    if (standalone) {
      const hideUntil = localStorage.getItem('permissions-hide-until');
      if (!hideUntil || new Date(hideUntil) < new Date()) {
        checkPermissions();
      }
    }
  }, []);

  const checkPermissions = async () => {
    let locNeeded = false;
    let notificationNeeded = false;

    // Értesítések
    if ('Notification' in window && Notification.permission === 'default') {
      notificationNeeded = true;
    }

    // Helyadatok
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'prompt') {
          locNeeded = true;
        } else if (status.state === 'denied') {
          // Ha már elutasították, ne mutassuk a gombot, csak ha kifejezetten a térképnél vagyunk
          locNeeded = false; 
        }
      } catch (e) {
        locNeeded = true; // Ha nem támogatja a query-t, próbálkozzunk
      }
    }

    setNeedsLocation(locNeeded);
    setNeedsNotifications(notificationNeeded);
    
    if (locNeeded || notificationNeeded) {
      setIsDismissed(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + 3);
    localStorage.setItem('permissions-hide-until', hideUntil.toISOString());
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setNeedsLocation(false);
        if (!needsNotifications) setIsDismissed(true);
      },
      (err) => {
        console.error("Location error:", err);
        if (err.code === 1) { // PERMISSION_DENIED
          setShowManualHint(true);
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const requestNotifications = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNeedsNotifications(false);
      if (!needsLocation) setIsDismissed(true);
    }
  };

  if (!isStandalone || isDismissed || (!needsLocation && !needsNotifications && !showManualHint)) return null;

  return (
    <div className="fixed top-20 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-5 rounded-3xl z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-black text-lg tracking-tight">Funkciók aktiválása</h3>
          <p className="text-slate-400 text-xs">A teljes élményhez engedélyezd a következőket:</p>
        </div>
        <button onClick={handleDismiss} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <div className="space-y-3">
        {needsLocation && (
          <button 
            onClick={requestLocation}
            className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-4 rounded-2xl text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Helymeghatározás</div>
                <div className="text-[10px] text-emerald-400/80 italic">A közeli szolgáltatásokhoz</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 px-3 py-1.5 rounded-full">Engedélyezés</span>
          </button>
        )}

        {showManualHint && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-200/80 leading-relaxed">
              Úgy tűnik, a helyadatok le vannak tiltva. Kattints a böngésző sávban a <strong>Lakat</strong> ikonra az engedélyezéshez!
            </p>
          </div>
        )}
        
        {needsNotifications && (
          <button 
            onClick={requestNotifications}
            className="w-full flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-4 rounded-2xl text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Értesítések</div>
                <div className="text-[10px] text-blue-400/80">Emlékeztetők és frissítések</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500 px-3 py-1.5 rounded-full">Bekapcsolás</span>
          </button>
        )}
      </div>
    </div>
  );
}