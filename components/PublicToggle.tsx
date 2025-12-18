'use client';

import { useState, useTransition } from 'react';
import { Globe, Lock, Loader2, ArrowUpRight } from 'lucide-react';
import { toggleCarVisibility } from '@/app/cars/actions'; // Feltételezve, hogy itt van a server action
import { useRouter } from 'next/navigation';

interface PublicToggleProps {
  carId: string;
  isPublicInitial: boolean;
}

export default function PublicToggle({ carId, isPublicInitial }: PublicToggleProps) {
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    const newState = !isPublic;
    setIsPublic(newState); // Optimista UI frissítés

    startTransition(async () => {
      try {
        await toggleCarVisibility(carId, newState);
        router.refresh();
      } catch (e) {
        setIsPublic(!newState); // Hiba esetén visszaállítjuk
        console.error("Hiba a módosításkor", e);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        relative w-full group overflow-hidden rounded-2xl p-1 transition-all duration-500 ease-out border-2 shadow-sm
        ${isPublic 
          ? 'bg-slate-900 border-slate-900 dark:bg-white dark:border-white' // FEKETE TÉMA (Aktív)
          : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800' // FEHÉR TÉMA (Inaktív)
        }
      `}
    >
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        
        {/* Bal oldal: Ikon és szöveg */}
        <div className="flex items-center gap-4">
          <div className={`
            p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center
            ${isPublic 
              ? 'bg-white/10 text-white dark:bg-slate-900/10 dark:text-slate-900' 
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }
          `}>
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPublic ? (
              <Globe className="w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>

         <div className="text-left max-w-[200px] leading-tight">
            <p className={`text-sm font-bold transition-colors duration-300 ${isPublic ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>
              {isPublic ? 'Nyilvános & Kereshető' : 'Privát adatlap'}
            </p>
            <p className={`text-[10px] font-medium mt-0.5 transition-colors duration-300 ${isPublic ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500'}`}>
              {isPublic 
                ? 'Hozzájárulok, hogy alvázszám alapján bárki lekérdezhesse az autót.' 
                : 'Az autó rejtett, nem kereshető alvázszám alapján.'}
            </p>
          </div>
        </div>

        {/* Jobb oldal: Kapcsoló animáció */}
        <div className="flex items-center gap-3">
            {isPublic && (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/40 dark:text-slate-900/40">
                Élő <ArrowUpRight className="w-3 h-3" />
              </span>
            )}
            
            {/* Switch háttér */}
            <div className={`
              w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center
              ${isPublic 
                ? 'bg-white/20 dark:bg-slate-900/10' 
                : 'bg-slate-200 dark:bg-slate-700'
              }
            `}>
              {/* Switch gombóc */}
              <div className={`
                w-5 h-5 rounded-full shadow-md transition-all duration-300 transform
                ${isPublic 
                  ? 'translate-x-5 bg-white dark:bg-slate-900' 
                  : 'translate-x-0 bg-white dark:bg-slate-400'
                }
              `} />
            </div>
        </div>
      </div>
    </button>
  );
}