'use client'

import { useEffect, useRef } from 'react'
import { getUpcomingRemindersForUI } from '@/app/actions' // Ezt mindjárt megírjuk
import { toast } from 'sonner' 

export default function ReminderChecker() {
  // Ref, hogy ne fusson le kétszer React Strict Mode-ban fejlesztés alatt
  const hasChecked = useRef(false)

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true

    async function runCheck() {
      try {
        // Ez egy ÚJ függvény, ami csak OLVAS, nem ír!
        const reminders = await getUpcomingRemindersForUI()

        if (reminders && reminders.length > 0) {
          // Engedély kérése a böngésző értesítéshez
          if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            await Notification.requestPermission()
          }

          reminders.forEach((rem: any) => {
            const msg = `${rem.cars.make} ${rem.cars.model}: ${rem.service_type} esedékes (${new Date(rem.due_date).toLocaleDateString('hu-HU')})`

            // 1. Appon belüli Toast
            toast.warning(msg, {
              duration: 6000,
              action: {
                label: 'Megnézem',
                onClick: () => window.location.href = `/cars/${rem.car_id}`
              }
            })

            // 2. Böngésző értesítés (ha épp nincs az ablakban)
            if (Notification.permission === 'granted' && document.hidden) {
               new Notification('DynamicSense Figyelmeztetés', { body: msg })
            }
          })
        }
      } catch (error) {
        console.error("Hiba az emlékeztetők ellenőrzésekor:", error)
      }
    }

    runCheck()
  }, [])

  return null
}