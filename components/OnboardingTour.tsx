'use client'

import { useEffect } from 'react'
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function OnboardingTour() {
  
  useEffect(() => {
    // 1. Ellenőrizzük, látta-e már a user a túrát
    const hasSeenTour = localStorage.getItem('dynamicsense_tour_completed');
    
    // Ha már látta, ne induljon el
    if (hasSeenTour) {
        return;
    }

    // 2. Driver konfigurálása
    const driverObj = driver({
      showProgress: true, // Pöttyök mutatása
      animate: true,
      allowClose: true,   // Engedélyezi a bezárást (Skip)
      doneBtnText: 'Befejezés',
      nextBtnText: 'Tovább',
      prevBtnText: 'Vissza',
      progressText: '{{current}} / {{total}}',
      
      // Stílus finomhangolás (hogy illeszkedjen a designhoz)
      popoverClass: 'driverjs-theme',
      
      // LÉPÉSEK DEFINIÁLÁSA
      steps: [
        { 
            element: '#tour-welcome', 
            popover: { 
                title: 'Üdv a DynamicSense-ben! 👋', 
                description: 'Ez a te digitális garázsod. Nézzük meg gyorsan, mit hol találsz!' 
            } 
        },
        { 
            element: '#tour-add-car', 
            popover: { 
                title: 'Első Autó Hozzáadása 🚗', 
                description: 'Itt tudod rögzíteni az első járművedet. Ez a legfontosabb lépés az induláshoz.' 
            } 
        },
        { 
            element: '#tour-service-map', 
            popover: { 
                title: 'Szerviz Térkép 🗺️', 
                description: 'Találd meg a legjobb szerelőket és autómosókat a közeledben.' 
            } 
        },
        { 
            element: '#tour-stats', 
            popover: { 
                title: 'Költségek & Statisztika 📊', 
                description: 'Itt látod majd összesítve, mennyit költöttél az autódra az elmúlt hónapban.' 
            } 
        },
      ],

      // 3. Ha a user bezárja (Skip) vagy végigcsinálja, mentsük el
      onDestroyStarted: () => {
        localStorage.setItem('dynamicsense_tour_completed', 'true');
        driverObj.destroy();
      },
    });

    // Indítás kis késleltetéssel, hogy a DOM biztosan betöltődjön
    setTimeout(() => {
        driverObj.drive();
    }, 1000);

  }, []);

  return null; // Ez a komponens nem renderel semmit a DOM-ba
}