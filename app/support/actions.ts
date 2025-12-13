'use server'

import { createClient } from '@/supabase/server'
import { redirect } from 'next/navigation'

export async function submitTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nincs bejelentkezve" }

  const type = formData.get('type') as string
  const priority = formData.get('priority') as string
  const subject = formData.get('subject') as string
  const description = formData.get('description') as string
  const deviceInfo = formData.get('deviceInfo') as string

  // Itt lehetne a képfeltöltést kezelni (Storage bucket), 
  // de az egyszerűség kedvéért most csak az adatokat mentjük.

  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    type,
    priority,
    subject,
    description,
    device_info: JSON.parse(deviceInfo || '{}')
  })

  if (error) {
    console.error(error)
    return { error: "Hiba történt a mentéskor." }
  }

  return { success: true }
}