import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any, // <--- ÍGY
  typescript: true,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// --- ADMIN KLIENS (RLS megkerülése) ---
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// --- PLAN MAPPING (Stripe Price ID -> DB Plan Enum) ---
// Ezeket cseréld le a TE Stripe Price ID-jaidra!
const PRICE_MAP: Record<string, string> = {
  'price_1SjPQzRbHGQdHUF40biCuF2v': 'pro',      // Havi Pro
  'price_1SjPRYRbHGQdHUF4E86ttykq': 'pro',      // Éves Pro
  'price_1SjPSMRbHGQdHUF42Ngnfo41': 'lifetime' // Lifetime
}

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature') as string

  let event: Stripe.Event

  // 1. Aláírás ellenőrzése (Biztonság)
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // 2. Esemény kezelése
  try {
    switch (event.type) {
      // SIKERES FIZETÉS (Egyszeri vagy Előfizetés első alkalom)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      // ELŐFIZETÉS MEGÚJÍTÁSA (Sikeres havi levonás)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        // Itt kezelheted a megújítást, ha logolni akarod, 
        // de a státusz már "active" maradt, szóval kritikus teendő nincs,
        // kivéve ha lejárati dátumot akarsz frissíteni.
        break
      }

      // ELŐFIZETÉS TÖRLÉSE / LEJÁRATA
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
    }
  } catch (error) {
    console.error('Hiba a webhook feldolgozása közben:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  return new NextResponse(null, { status: 200 })
}

// --- LOGIKA: SIKERES FIZETÉS ---
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  // A checkout létrehozásakor a 'client_reference_id'-ba tettük a user.id-t
  const userId = session.client_reference_id
  const subscriptionId = session.subscription as string // Ha előfizetés
  const customerId = session.customer as string

  // Megkeressük, mit vett meg (Price ID alapján)
  // Ha több tétel van, feltételezzük, hogy az első az előfizetés
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const priceId = lineItems.data[0]?.price?.id

  if (!userId || !priceId) {
    console.error('Hiányzó adatok a sessionből:', { userId, priceId })
    return
  }

  const planType = PRICE_MAP[priceId] || 'free'

  // Adatok mentése a Supabase-be
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId || null, // Lifetime-nál ez null lehet
      plan_type: planType,
      status: 'active',
      // Ha előfizetés, lekérjük a végét, ha lifetime, akkor NULL (örök)
      current_period_end: subscriptionId 
        ? new Date((session.expires_at || Date.now() / 1000) * 1000).toISOString() 
        : null, 
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Supabase írási hiba:', error)
    throw error
  }
  
  console.log(`✅ Sikeres aktiválás: User ${userId} -> ${planType}`)
}

// --- LOGIKA: ELŐFIZETÉS MEGSZŰNÉSE ---
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Megkeressük a usert a stripe_subscription_id alapján
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ 
      status: 'canceled', // Vagy 'expired'
      plan_type: 'free',  // Visszaminősítjük free-re
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) console.error('Hiba a lemondás kezelésekor:', error)
  else console.log(`🚫 Előfizetés megszűnt: ${subscription.id}`)
}