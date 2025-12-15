'use client'

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

interface ShareButtonProps {
  title?: string;
  carId?: string | number; // Opcionális ID
}

export default function ShareButton({ title, carId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // ITT A LÉNYEG:
    // Ha kaptunk carId-t, akkor a publikus '/hirdetes/' útvonalat rakjuk össze.
    // Ha nem, akkor marad a jelenlegi oldal URL-je.
    const baseUrl = window.location.origin // pl: https://dynamicsense.hu
    const shareUrl = carId 
      ? `${baseUrl}/hirdetes/${carId}` 
      : window.location.href

    const shareData = {
      title: title || 'Nézd meg ezt az autót a DynamicSense-en!',
      text: 'Találtam egy érdekes autót, nézd meg a részleteket:',
      url: shareUrl,
    }

    // Mobilos natív megosztás
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        console.log('Megosztás megszakítva')
      }
    }

    // Asztali gép / vágólapra másolás
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Hiba másoláskor', err)
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-bold transition-all active:scale-95"
      title="Publikus link megosztása"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-600 hidden sm:inline">Link másolva!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Megosztás</span>
          <span className="sm:hidden">Link</span>
        </>
      )}
    </button>
  )
}