import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
    }

    // 1. Lekérjük a jelenlegi adatokat
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    // 2. HA NINCS STRIPE ID (pl. Admin panelen adtuk a jogot), LÉTREHOZZUK MOST!
    if (!customerId) {
        console.log(`Hiányzó Stripe ID a felhasználónál (${user.email}). Létrehozás...`)
        
        // A. Létrehozás a Stripe-on
        const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: {
                userId: user.id
            }
        })
        customerId = newCustomer.id

        // B. Mentés a Supabase-be (Service Role-lal, hogy biztosan írhassuk)
        // (Itt feltételezzük, hogy már van sora a subscriptions táblában, csak az ID hiányzik)
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ stripe_customer_id: customerId })
            .eq('user_id', user.id)

        if (updateError) {
             // Ha nincs még sora, akkor létrehozzuk (bár elvileg van, ha látja a gombot)
             await supabase.from('subscriptions').upsert({
                 user_id: user.id,
                 stripe_customer_id: customerId,
                 plan_type: 'free', // Alapérték, ha új sor
                 status: 'active'
             })
        }
    }

    // 3. Most már biztosan van ID, létrehozzuk a Portal Session-t
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('Stripe Portal Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}