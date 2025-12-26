'use client';

import { useState, useEffect } from 'react';
import { MapPin, Bell, X } from 'lucide-react';

export default function PermissionManager() {
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsNotifications, setNeedsNotifications] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Alapból rejtve, amíg az ellenőrzés le nem fut

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    if (standalone) {
      // Csak akkor ellenőrizzük, ha nem nyomott rá az "Elrejtés"-re korábban
      const hideUntil = localStorage.getItem('permissions-hide-until');
      if (!hideUntil || new Date(hideUntil) < new Date()) {
        checkPermissions();
      }
    }
  }, []);

  const checkPermissions = async () => {
    let locNeeded = false;
    let notificationNeeded = false;

    // Értesítések ellenőrzése
    if (Notification.permission === 'default') {
      notificationNeeded = true;
    }

    // Helyadatok ellenőrzése
    if ('permissions' in navigator) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'prompt') {
        locNeeded = true;
      }
    }

    setNeedsLocation(locNeeded);
    setNeedsNotifications(notificationNeeded);
    
    // Ha bármelyikre szükség van, mutassuk meg a panelt
    if (locNeeded || notificationNeeded) {
      setIsDismissed(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Elrejtés 3 napra, hogy ne legyen idegesítő
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
      (err) => console.error(err)
    );
  };

  const requestNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNeedsNotifications(false);
      if (!needsLocation) setIsDismissed(true);
    }
  };

  // Ha nem telepített app, vagy már el lett utasítva, vagy minden engedély megvan: ne mutassunk semmit
  if (!isStandalone || isDismissed || (!needsLocation && !needsNotifications)) return null;

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
            className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-4 rounded-2xl text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Helymeghatározás</div>
                <div className="text-[10px] text-emerald-400/80">Térkép és szervizkereső</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500 px-3 py-1.5 rounded-full">Engedélyezés</span>
          </button>
        )}
        
        {needsNotifications && (
          <button 
            onClick={requestNotifications}
            className="w-full flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-4 rounded-2xl text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Értesítések</div>
                <div className="text-[10px] text-blue-400/80">Szerviz és okmány emlékeztetők</div>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-500 px-3 py-1.5 rounded-full">Bekapcsolás</span>
          </button>
        )}
      </div>
    </div>
  );
}