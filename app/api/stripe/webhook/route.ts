import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  
  // JAVÍTÁS: (await headers()) használata
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // --- ESEMÉNYEK KEZELÉSE ---

  // 1. Sikeres fizetés (Előfizetés vagy Egyszeri)
  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId

    if (userId) {
      // Ha 'payment' a mód, akkor az a Lifetime csomag, egyébként Pro
      // (Feltételezve, hogy a 'founder' nálad a Lifetime csomag kódja a DB-ben)
      const planType = session.mode === 'payment' ? 'founder' : 'pro'

      // Adatbázis frissítése
      const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          stripe_customer_id: session.customer as string,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        
      if (error) console.error('Supabase hiba:', error)
    }
  }

  // 2. Előfizetés lemondása/törlése (Opcionális)
  if (event.type === 'customer.subscription.deleted') {
    console.log('Előfizetés törölve:', session.customer)
    // Ide írhatsz logikát, ha vissza akarod állítani 'free'-re
  }

  return NextResponse.json({ received: true })
}