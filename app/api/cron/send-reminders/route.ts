import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Fontos: Ez biztosítja, hogy a funkció mindig friss adatokat kérjen le (ne cache-eljen)
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Biztonsági ellenőrzés (hogy ne bárki hívhassa meg a böngészőből)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Ez a titkos kulcs kell a backendhez!
    )

    const today = new Date()
    const notificationWindow = new Date()
    notificationWindow.setDate(today.getDate() + 3) // 3 napos ablak

    // 2. Emlékeztetők lekérése
    const { data: reminders, error } = await supabase
      .from('service_reminders')
      .select('*, cars(make, model, plate, user_id)')
      .eq('notify_email', true)
      .eq('notification_sent', false)
      .lte('due_date', notificationWindow.toISOString().split('T')[0])
      .gte('due_date', today.toISOString().split('T')[0])

    if (error) throw error

    const results = []

    // 3. Email küldés
    for (const reminder of reminders) {
      // User email lekérése
      const { data: { user } } = await supabase.auth.admin.getUserById(reminder.user_id)

      if (user && user.email) {
        // @ts-ignore
        const carInfo = reminder.cars // Type assertion miatt

        const { error: emailError } = await resend.emails.send({
          from: 'DriveSync <onboarding@resend.dev>', // Teszthez jó, élesben saját domain kell
          to: [user.email],
          subject: `🔔 Szerviz: ${carInfo.make} ${carInfo.model}`,
          html: `
            <h1>Szia!</h1>
            <p>Emlékeztető: A(z) <strong>${carInfo.make} ${carInfo.model}</strong> (${carInfo.plate}) autódnak hamarosan szervizre van szüksége.</p>
            <p><strong>Teendő:</strong> ${reminder.service_type}</p>
            <p><strong>Dátum:</strong> ${reminder.due_date}</p>
            <p>Megjegyzés: ${reminder.note || '-'}</p>
          `
        })

        if (!emailError) {
          // Státusz frissítése
          await supabase
            .from('service_reminders')
            .update({ notification_sent: true })
            .eq('id', reminder.id)
          
          results.push({ id: reminder.id, status: 'sent' })
        }
      }
    }

    return NextResponse.json({ success: true, sent_count: results.length })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}