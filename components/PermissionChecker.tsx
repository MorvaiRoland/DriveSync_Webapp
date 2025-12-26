'use client';

import { useState, useEffect } from 'react';
import { MapPin, Bell } from 'lucide-react';

export default function PermissionManager() {
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsNotifications, setNeedsNotifications] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Ellenőrizzük, hogy telepített appként fut-e
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(standalone);

    if (standalone) {
      // Jogosultságok ellenőrzése
      checkPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    // Értesítések ellenőrzése
    if (Notification.permission !== 'granted') {
      setNeedsNotifications(true);
    }

    // Helyadatok ellenőrzése (Permissions API)
    if ('permissions' in navigator) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state !== 'granted') {
        setNeedsLocation(true);
      }
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setNeedsLocation(false);
        alert("Helyadatok engedélyezve!");
      },
      (err) => console.error(err)
    );
  };

  const requestNotifications = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNeedsNotifications(false);
      alert("Értesítések engedélyezve!");
    }
  };

  if (!isStandalone || (!needsLocation && !needsNotifications)) return null;

  return (
    <div className="fixed top-20 left-4 right-4 bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 p-4 rounded-2xl z-50 shadow-2xl">
      <h3 className="text-white font-bold text-sm mb-3">Szolgáltatások aktiválása</h3>
      <div className="space-y-3">
        {needsLocation && (
          <button 
            onClick={requestLocation}
            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="text-xs">Térkép és helyadatok engedélyezése</span>
            </div>
            <span className="text-[10px] bg-emerald-500 px-2 py-1 rounded-full">Aktiválás</span>
          </button>
        )}
        
        {needsNotifications && (
          <button 
            onClick={requestNotifications}
            className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 p-3 rounded-xl text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-cyan-400" />
              <span className="text-xs">Értesítések bekapcsolása</span>
            </div>
            <span className="text-[10px] bg-cyan-500 px-2 py-1 rounded-full">Aktiválás</span>
          </button>
        )}
      </div>
    </div>
  );
}