'use client'

import { Trash2 } from 'lucide-react'
import { deleteDMAction } from '@/app/community/actions' // Ellenőrizd az elérési utat!
import { useState } from 'react'

export default function DeleteDMButton({ partnerId }: { partnerId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    // Biztonsági kérdés
    if (window.confirm('Biztosan törölni szeretnéd a teljes beszélgetést? A művelet nem visszavonható.')) {
      setIsDeleting(true)
      await deleteDMAction(partnerId)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all group"
      title="Beszélgetés törlése"
    >
      <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
    </button>
  )
}