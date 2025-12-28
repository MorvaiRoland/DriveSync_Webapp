'use client'

import { useState, useEffect } from 'react'
import { X, CarFront, BarChart3, Map, ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Ellenőrzés: látta-e már? (Új kulcs: _v4 a biztonság kedvéért)
    const hasSeen = localStorage.getItem('dynamicsense_tour_completed_v4') 
    if (!hasSeen) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem('dynamicsense_tour_completed_v4', 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  // Típusdefiníció a TypeScript hibák elkerülésére
  type Step = {
    title: string;
    desc: string;
    icon: React.ReactNode;
    action: {
      label: string;
      href?: string;
      onClick?: () => void;
    } | null;
  };

  const steps: Step[] = [
    {
      title: "Üdv a DynamicSense-ben! 👋",
      desc: "Ez a te digitális garázsod. Kezelj mindent egy helyen: szervizek, költségek, tankolások.",
      icon: <CarFront className="w-12 h-12 text-blue-500" />,
      action: null
    },
    {
      title: "Első lépés: Autó hozzáadása 🚗",
      desc: "Kezdjük a legfontosabbal! Rögzítsd az első járművedet, hogy elkezdhessük az elemzést.",
      icon: <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">1</div>,
      action: { label: "Hozzáadás most", href: "/cars/new" }
    },
    {
      title: "Kövesd a költségeket 📊",
      desc: "Látni fogod, mennyit költesz tankolásra és szervizre. Az AI segít optimalizálni a kiadásaidat.",
      icon: <BarChart3 className="w-12 h-12 text-green-500" />,
      action: null
    },
    {
      title: "Készen állsz? 🚀",
      desc: "A rendszer készen áll. Vágj bele és építsd fel a garázsodat!",
      icon: <Check className="w-12 h-12 text-emerald-600" />,
      action: { label: "Indulás!", onClick: handleComplete }
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Sötét háttér */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleComplete} />
      
      {/* Modál ablak */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 w-full">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <button onClick={handleComplete} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center text-center relative">
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-bounce-slow shadow-sm border border-slate-100 dark:border-slate-700">
            {steps[step].icon}
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
            {steps[step].title}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
            {steps[step].desc}
          </p>

          <div className="flex gap-3 w-full">
            {step > 0 && (
                <button 
                    onClick={() => setStep(step - 1)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Vissza
                </button>
            )}
            
            {/* JAVÍTOTT GOMB LOGIKA: Ellenőrizzük, hogy van-e href */}
            {steps[step].action && steps[step].action.href ? (
                <button 
                    onClick={() => {
                        handleComplete();
                        // A ! jel azt mondja a TS-nek: "Bízz bennem, ez a href létezik, mert a fenti feltétel igaz volt"
                        router.push(steps[step].action!.href!); 
                    }}
                    className="flex-[2] py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
                >
                    {steps[step].action.label} <ArrowRight className="w-4 h-4" />
                </button>
            ) : (
                <button 
                    onClick={steps[step].action?.onClick || handleNext}
                    className="flex-[2] py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                >
                    {steps[step].action?.label || "Tovább"} <ArrowRight className="w-4 h-4" />
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}