'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    // Csak production-ben és csak ha támogatott
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator && 
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ SW Regisztrálva (Scope: ' + registration.scope + ')');
        })
        .catch((err) => {
          console.error('❌ SW Hiba:', err);
        });
    }
  }, []);

  return null;
}