'use client'

import { useEffect, useState } from 'react'
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function OnboardingTour() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (!mounted) return;

    // 1. KULCS VÁLTOZTATÁS: Átírtam '_v2'-re, hogy teszteléskor biztosan lefusson újra!
    // Élesben majd visszanevezheted simára.
    const TOUR_KEY = 'dynamicsense_tour_completed_v2';
    const hasSeenTour = localStorage.getItem(TOUR_KEY);
    
    if (hasSeenTour) {
        console.log("Onboarding: A felhasználó már látta a túrát.");
        return;
    }

    // 2. KÉSLELTETETT INDÍTÁS + DOM ELLENŐRZÉS
    // Nem csak várunk, hanem ellenőrizzük is, hogy létezik-e az elem.
    const timer = setTimeout(() => {
        const welcomeElement = document.getElementById('tour-welcome');
        const addCarElement = document.getElementById('tour-add-car');

        // Ha még mindig nincs betöltve a fő elem, nem indítjuk el a hibák elkerülése végett
        if (!welcomeElement) {
            console.warn("Onboarding: #tour-welcome elem nem található, túra kihagyva.");
            return;
        }

        const driverObj = driver({
          showProgress: true,
          animate: true,
          allowClose: true,
          doneBtnText: 'Kész',
          nextBtnText: 'Tovább',
          prevBtnText: 'Vissza',
          progressText: '{{current}} / {{total}}',
          popoverClass: 'driverjs-theme', // Ezt a CSS-t majd definiálni kell a globals.css-ben, vagy vedd ki
          
          steps: [
            { 
                element: '#tour-welcome', 
                popover: { 
                    title: 'Üdv a DynamicSense-ben! 👋', 
                    description: 'Ez a te digitális garázsod. Kezdjük egy gyors bemutatóval!',
                    side: "bottom", 
                    align: 'start'
                } 
            },
            // DINAMIKUS LÉPÉS: Csak akkor adjuk hozzá, ha létezik a gomb (pl. nincs elérve a limit)
            ...(addCarElement ? [{ 
                element: '#tour-add-car', 
                popover: { 
                    title: 'Első Autó Hozzáadása 🚗', 
                    description: 'Itt tudod rögzíteni az első járművedet. Ez a legfontosabb lépés az induláshoz.',
                    side: "bottom" as const
                } 
            }] : []),
            { 
                element: '#tour-stats', 
                popover: { 
                    title: 'Statisztikák 📊', 
                    description: 'Itt látod majd a flotta állapotát és a költségeket.',
                    side: "top" 
                } 
            }
          ],

          onDestroyStarted: () => {
            // Ha a user bezárja vagy végigér, elmentjük
            localStorage.setItem(TOUR_KEY, 'true');
            driverObj.destroy();
          },
        });

        console.log("Onboarding: Túra indítása...");
        driverObj.drive();

    }, 2000); // 2 másodpercet adunk a Next.js-nek, hogy mindent kirajzoljon

    return () => clearTimeout(timer);

  }, [mounted]);

  return null;
}