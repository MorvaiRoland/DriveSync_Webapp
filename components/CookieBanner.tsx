'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Ellenőrizzük, hogy volt-e már elfogadva
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setShow(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur border-t border-slate-700 p-4 z-[100] shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300">
          <p className="font-bold text-white mb-1">Ez az oldal sütiket (cookies) használ 🍪</p>
          <p>A felhasználói élmény javítása és a bejelentkezés fenntartása érdekében sütiket használunk. <a href="/privacy" className="underline hover:text-amber-500">Tudj meg többet.</a></p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={acceptCookies}
                className="bg-white text-slate-900 px-6 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
                Rendben, elfogadom
            </button>
        </div>
      </div>
    </div>
  )
}