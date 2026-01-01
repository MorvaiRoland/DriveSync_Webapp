'use server'

import { createClient } from '@/supabase/server'
import { v4 as uuidv4 } from 'uuid' // Ha nincs uuid, használhatsz Date.now()-t is

export async function submitTicket(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Nincs bejelentkezve" }

  // Adatok kinyerése
  const type = formData.get('type') as string
  const priority = formData.get('priority') as string || 'normal'
  const subject = formData.get('subject') as string
  const description = formData.get('description') as string
  const deviceInfo = formData.get('deviceInfo') as string
  
  // --- KÉPFELTÖLTÉS LOGIKA ---
  const file = formData.get('attachment') as File | null;
  let publicUrl = null;

  if (file && file.size > 0) {
    try {
      // Egyedi fájlnév generálása: user_id / timestamp_filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Feltöltés a Supabase Storage-ba
      const { error: uploadError } = await supabase.storage
        .from('support-attachments') // A bucket neve, amit létrehoztál
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { error: "Hiba a kép feltöltésekor." };
      }

      // Publikus URL lekérése
      const { data } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(filePath);
        
      publicUrl = data.publicUrl;
      
    } catch (err) {
      console.error('Hiba a fájlkezelés közben:', err);
      return { error: "Fájlkezelési hiba." };
    }
  }

  // --- MENTÉS AZ ADATBÁZISBA ---
  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    type,
    priority,
    subject,
    description,
    device_info: JSON.parse(deviceInfo || '{}'),
    attachment_url: publicUrl // Itt mentjük el a linket
  })

  if (error) {
    console.error('Database insert error:', error)
    return { error: "Hiba történt a mentéskor." }
  }

  return { success: true }
}