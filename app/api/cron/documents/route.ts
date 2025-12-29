import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import DocumentExpiryEmail from '@/components/emails/DocumentExpiryEmail' // Ezt mindjárt létrehozzuk

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // 1. Biztonsági ellenőrzés
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Kliensek inicializálása
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const resend = new Resend(process.env.RESEND_API_KEY)

    // 3. Dátum kiszámítása (Ma + 3 nap)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 3)
    const targetDateStr = targetDate.toISOString().split('T')[0] // Formátum: YYYY-MM-DD

    console.log(`[CRON] Okmány lejárat ellenőrzése erre a napra: ${targetDateStr}`)

    let notificationsSent = 0

    // --- A) MŰSZAKI VIZSGA (MOT) ELLENŐRZÉSE ---
    const { data: motCars, error: motError } = await supabaseAdmin
      .from('cars')
      .select('id, make, model, plate, user_id, mot_expiry')
      .eq('mot_expiry', targetDateStr)

    if (motError) throw motError

    for (const car of motCars || []) {
      await sendNotification(supabaseAdmin, resend, car.user_id, {
        type: 'Műszaki vizsga',
        carName: `${car.make} ${car.model}`,
        plate: car.plate,
        date: car.mot_expiry
      })
      notificationsSent++
    }

    // --- B) BIZTOSÍTÁS (INSURANCE) ELLENŐRZÉSE ---
    const { data: insCars, error: insError } = await supabaseAdmin
      .from('cars')
      .select('id, make, model, plate, user_id, insurance_expiry')
      .eq('insurance_expiry', targetDateStr)

    if (insError) throw insError

    for (const car of insCars || []) {
      await sendNotification(supabaseAdmin, resend, car.user_id, {
        type: 'Kötelező biztosítás',
        carName: `${car.make} ${car.model}`,
        plate: car.plate,
        date: car.insurance_expiry
      })
      notificationsSent++
    }

    return NextResponse.json({ success: true, notifications_sent: notificationsSent })

  } catch (error: any) {
    console.error("Cron hiba (Okmányok):", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// --- SEGÉDFÜGGVÉNY A KÜLDÉSHEZ ---
async function sendNotification(supabase: any, resend: any, userId: string, data: any) {
  // 1. User emailjének lekérése az Auth-ból
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  
  if (!user?.email) return

  // 2. User profiljának lekérése (Push tokenhez)
  // Feltételezem, hogy van egy 'profiles' táblád, ahol a push_token van.
  // Ha nincs, ezt a lépést hagyd ki vagy igazítsd a DB-hez.
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', userId)
    .single()

  const pushToken = profile?.push_token

  // 3. Email Küldése
  const emailHtml = await render(
    DocumentExpiryEmail({
      userName: user.user_metadata?.full_name || 'Felhasználó',
      carName: data.carName,
      plate: data.plate,
      docType: data.type,
      expiryDate: data.date
    })
  )

  await resend.emails.send({
    from: 'DynamicSense <info@dynamicsense.hu>',
    to: [user.email],
    subject: `⚠️ Lejáró ${data.type}: ${data.carName}`,
    html: emailHtml
  })

  // 4. Push Notification Küldése (Ha van token)
  if (pushToken) {
    await sendPushNotification(pushToken, data.type, data.carName)
  }
}

// --- PUSH KÜLDŐ FÜGGVÉNY (Expo példa) ---
async function sendPushNotification(token: string, docType: string, carName: string) {
  // Ha Expo-t használsz (React Native / Mobile):
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      title: `Lejáró ${docType}!`,
      body: `${carName} okmánya 3 nap múlva lejár.`,
      sound: 'default',
      data: { url: '/garage' }, // Ide irányítson, ha rákattint
    }),
  })
}