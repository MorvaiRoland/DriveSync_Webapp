'use client'

import { useEffect } from 'react'
import { checkAndSendReminders } from '@/app/cars/[id]/actions' // Importáld a fenti függvényt
import { toast } from 'sonner' // Vagy amit használsz toast-nak

export default function ReminderChecker() {
  useEffect(() => {
    async function runCheck() {
      // Ez hívja meg a szervert
      const result = await checkAndSendReminders()

      // Ha van "Push" (böngésző) értesítés, itt jelenítjük meg
      if (result && result.alerts.length > 0) {
        result.alerts.forEach(msg => {
          // 1. Próbáljunk natív böngésző értesítést küldeni
          if (Notification.permission === 'granted') {
             new Notification('DynamicSense Emlékeztető', { body: msg })
          } else if (Notification.permission !== 'denied') {
             Notification.requestPermission().then(permission => {
               if (permission === 'granted') {
                 new Notification('DynamicSense Emlékeztető', { body: msg })
               }
             })
          }

          // 2. Mindenképp dobjunk egy Toast üzenetet is az appban
          toast.warning(`Esedékes szerviz: ${msg}`)
        })
      }
    }

    runCheck()
  }, [])

  return null // Ez egy láthatatlan komponens
}