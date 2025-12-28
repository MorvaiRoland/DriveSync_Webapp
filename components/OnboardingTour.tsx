'use client'

import { useEffect } from 'react'
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function OnboardingTour() {
  
  useEffect(() => {
    // 1. Ellenőrizzük a böngészőben, látta-e már (localStorage)
    // Ez védi meg attól, hogy frissítéskor (F5) újra előjöjjön 24 órán belül.
    const hasSeenTour = localStorage.getItem('dynamicsense_tour_completed');
    
    if (hasSeenTour) {
        return;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      doneBtnText: 'Befejezés',
      nextBtnText: 'Tovább',
      prevBtnText: 'Vissza',
      progressText: '{{current}} / {{total}}',
      popoverClass: 'driverjs-theme',
      
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
        // Megjegyzés: Ellenőrizd, hogy a #tour-service-map elem létezik-e a Dashboardon, 
        // különben a driver.js hibát dobhat vagy átugorja.
        // { 
        //     element: '#tour-stats', 
        //     popover: { 
        //         title: 'Költségek & Statisztika 📊', 
        //         description: 'Itt látod majd összesítve, mennyit költöttél az autódra az elmúlt hónapban.' 
        //     } 
        // },
      ],

      // Fontos: Akár a "Befejezés", akár a "Bezárás" (X), akár a "félrekattintás" történik,
      // a túra befejezettnek minősül.
      onDestroyStarted: () => {
        localStorage.setItem('dynamicsense_tour_completed', 'true');
        driverObj.destroy();
      },
    });

    // Indítás
    const timer = setTimeout(() => {
        driverObj.drive();
    }, 1500); // Kicsit több időt adunk a Next.js hidrálásnak

    return () => clearTimeout(timer);

  }, []);

  return null;
}