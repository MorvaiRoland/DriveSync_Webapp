'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

// Elfogadjuk az ID-t prop-ként
export default function ShareButton({ title, carId }: { title?: string, carId: string | number }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    // ITT A LÉNYEG: Összerakjuk a publikus URL-t
    // window.location.origin megadja a domaint (pl. https://dynamicsense.hu)
    const shareUrl = `${window.location.origin}/hirdetes/${carId}`

    const shareData = {
      title: title || 'Nézd meg ezt az autót a DynamicSense-en!',
      text: 'Találtam egy érdekes autót, csekkold le a teljes szerviztörténetét:',
      url: shareUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        console.log('Megosztás megszakítva')
      }
    }

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
      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-bold transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-emerald-600">Link másolva!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>Megosztás</span>
        </>
      )}
    </button>
  )
}