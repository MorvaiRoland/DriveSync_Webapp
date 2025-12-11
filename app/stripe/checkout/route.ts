import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Ellenőrizzük, hogy van-e titkos kulcs
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

export async function POST(req: Request) {
  try {
    // 1. Felhasználó ellenőrzése
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
    }

    // 2. Adatok kiolvasása a kérésből
    const body = await req.json()
    const { priceId, mode } = body

    if (!priceId || !mode) {
      console.error('Hiányzó paraméterek:', body)
      return NextResponse.json({ error: 'Hiányzó ár vagy mód.' }, { status: 400 })
    }

    console.log(`Checkout indítása: User=${user.id}, Price=${priceId}, Mode=${mode}`)

    // 3. Stripe Session létrehozása
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode, // 'subscription' vagy 'payment'
      // FONTOS: A BASE_URL-nek be kell lennie állítva!
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('Stripe Checkout API Critical Error:', err)
    // Biztosítjuk, hogy mindig JSON választ adjunk, még hiba esetén is
    return NextResponse.json(
      { error: err.message || 'Belső szerverhiba történt.' }, 
      { status: 500 }
    )
  }
}