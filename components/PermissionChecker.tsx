'use client';

import { useState, useEffect } from 'react';
import { MapPin, Bell, X, Info } from 'lucide-react';

export default function PermissionManager() {
  // Alapból legyen TRUE (rejtett), hogy ne villanjon be
  const [isVisible, setIsVisible] = useState(false);
  
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsNotifications, setNeedsNotifications] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    // 1. Csak akkor futunk le, ha PWA módban vagyunk (vagy ha tesztelni akarod, vedd ki a feltételt)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (!isStandalone) return;

    // 2. Megnézzük, hogy "némitva" van-e a popup
    const hideUntil = localStorage.getItem('permissions_snooze_until');
    if (hideUntil && new Date(hideUntil) > new Date()) {
      return; // Ha még tart a némítás, megállunk, nem csinálunk semmit
    }

    // 3. Késleltetjük az ellenőrzést 3 másodperccel, hogy ne zavarjuk a betöltést
    const timer = setTimeout(() => {
      checkPermissions();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkPermissions = async () => {
    let locNeeded = false;
    let notificationNeeded = false;

    // --- ÉRTESÍTÉSEK ---
    // Csak akkor kérjük, ha "default" állapotban van (még nem döntött a user).
    // Ha "denied", akkor békén hagyjuk.
    if ('Notification' in window && Notification.permission === 'default') {
      notificationNeeded = true;
    }

    // --- HELYADATOK ---
    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        // Csak akkor kérjük, ha "prompt" (még nem döntött).
        // Ha "denied", nem zaklatjuk, mert úgysem tudjuk felülírni a böngészőt.
        if (status.state === 'prompt') {
          locNeeded = true;
        }
      } catch (e) {
        // Ha nem támogatott a query, óvatosan feltételezzük, hogy kellhet, 
        // de ez ritka modern böngészőknél
        locNeeded = true; 
      }
    }

    // Állapotok frissítése
    setNeedsLocation(locNeeded);
    setNeedsNotifications(notificationNeeded);

    // Csak akkor jelenítjük meg, ha TÉNYLEG kell valami
    if (locNeeded || notificationNeeded) {
      setIsVisible(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Némítás beállítása 30 NAPRA (hogy ne idegesítsen)
    const hideUntil = new Date();
    hideUntil.setDate(hideUntil.getDate() + 30); 
    localStorage.setItem('permissions_snooze_until', hideUntil.toISOString());
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setNeedsLocation(false);
        // Ha már csak ez kellett, be is zárhatjuk
        if (!needsNotifications) handleDismiss();
      },
      (err) => {
        console.error("Location error:", err);
        // Ha a user rányom, de a böngésző tiltja:
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
      if (!needsLocation) handleDismiss();
    } else if (permission === 'denied') {
      // Ha megtagadta, azonnal zárjuk be ezt a részt, ne kérjük többet
      setNeedsNotifications(false);
      if (!needsLocation) handleDismiss();
    }
  };

  // Ha nincs mit mutatni, ne rendereljünk semmit
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-8 md:w-96 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-5 rounded-3xl z-50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-white font-bold text-lg uppercase tracking-wide">App Engedélyek</h3>
          <p className="text-zinc-400 text-xs mt-1 font-medium">
            Az app teljes funkcionalitásához szükség van pár engedélyre.
          </p>
        </div>
        <button 
          onClick={handleDismiss} 
          className="p-2 -mr-2 -mt-2 hover:bg-zinc-800 rounded-full transition-colors group"
          aria-label="Bezárás"
        >
          <X className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
        </button>
      </div>

      <div className="space-y-3">
        {needsLocation && (
          <div className="w-full">
            <button 
              onClick={requestLocation}
              className="w-full flex items-center justify-between bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-3 rounded-2xl text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500 transition-colors duration-300">
                  <MapPin className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Helymeghatározás</div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all">
                Enged
              </span>
            </button>
            
            {showManualHint && (
              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 items-start animate-in fade-in zoom-in">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  A böngésző letiltotta a hozzáférést. Kattints a címsorban a <strong>Lakat 🔒</strong> ikonra a feloldáshoz.
                </p>
              </div>
            )}
          </div>
        )}

        {needsNotifications && (
          <button 
            onClick={requestNotifications}
            className="w-full flex items-center justify-between bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-3 rounded-2xl text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl group-hover:bg-blue-500 transition-colors duration-300">
                <Bell className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Értesítések</div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-all">
              Enged
            </span>
          </button>
        )}
      </div>
    </div>
  );
}