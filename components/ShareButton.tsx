'use client'

import { Share2, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const title = document.title

    // Ha a böngésző támogatja a natív megosztást (pl. mobil)
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch (err) {
        console.error('Megosztás megszakítva', err)
      }
    }

    // Fallback: Vágólapra másolás
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link másolva a vágólapra!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Nem sikerült másolni')
    }
  }

  return (
    <button 
        onClick={handleShare}
        className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 rounded-full transition-all active:scale-95" 
        title="Megosztás"
    >
        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
    </button>
  )
}