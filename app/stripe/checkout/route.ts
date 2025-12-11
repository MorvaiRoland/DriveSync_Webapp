import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
})

export async function POST(req: Request) {
  // 1. Felhasználó ellenőrzése
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
  }

  // 2. Adatok kiolvasása a kérésből
  const { priceId, mode } = await req.json()

  try {
    // 3. Stripe Session létrehozása
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode, // 'subscription' vagy 'payment' (egyszeri)
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      customer_email: user.email, // Kitölti az emailt a Stripe-on
      metadata: {
        userId: user.id, // FONTOS: Ezt küldjük vissza a Webhookban, hogy tudjuk ki fizetett
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe hiba:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}