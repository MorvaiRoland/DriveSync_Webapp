import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import ServiceReminderEmail from '@/components/emails/ServiceReminderEmail'

// Ez biztosítja, hogy mindig friss adatokat kérjen le
export const runtime = 'edge';
export const preferredRegion = 'lhr1'; // Kényszerítjük a Londoni régiót

export async function GET(request: Request) {
  try {
    // 1. Biztonsági ellenőrzés (Jelszó)
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Admin kliens inicializálása
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const resend = new Resend(process.env.RESEND_API_KEY)

    const today = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(today.getDate() + 3)

    // 3. Emlékeztetők keresése
    const { data: reminders, error } = await supabaseAdmin
      .from('service_reminders')
      .select('*, cars(make, model, plate, user_id)')
      .eq('notification_sent', false)
      .lte('due_date', threeDaysFromNow.toISOString().split('T')[0])

    if (error) throw error

    let emailCount = 0

    // 4. Emailek küldése
    for (const reminder of reminders) {
      if (reminder.notify_email) {
        // @ts-ignore
        const userResult = await supabaseAdmin.auth.admin.getUserById(reminder.user_id)
        const user = userResult.data.user

        if (user?.email) {
          const emailHtml = await render(
            ServiceReminderEmail({
              userName: user.user_metadata?.full_name || 'Felhasználó',
              // @ts-ignore
              carMake: reminder.cars.make,
              // @ts-ignore
              carModel: reminder.cars.model,
              // @ts-ignore
              plate: reminder.cars.plate,
              serviceType: reminder.service_type,
              dueDate: reminder.due_date,
              note: reminder.note
            })
          )

          await resend.emails.send({
            from: 'DynamicSense <info@dynamicsense.hu>',
            to: [user.email],
            subject: `🔔 Szerviz: ${reminder.cars.make} ${reminder.cars.model}`,
            html: emailHtml
          })
          
          emailCount++
        }
      }

      // 5. Megjelölés elküldöttként
      await supabaseAdmin
        .from('service_reminders')
        .update({ notification_sent: true })
        .eq('id', reminder.id)
    }

    return NextResponse.json({ success: true, emails_sent: emailCount })

  } catch (error: any) {
    console.error("Cron hiba:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}