import { createClient } from '@/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// 1. Biztonsági ellenőrzés: Megvan-e a kulcs?
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('CRITICAL ERROR: STRIPE_SECRET_KEY is missing from env variables!')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  typescript: true,
})

export async function POST(req: Request) {
  try {
    // 2. Környezeti változók ellenőrzése futásidőben
    if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Szerver konfigurációs hiba: Hiányzó Stripe Kulcs' }, { status: 500 })
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
        return NextResponse.json({ error: 'Szerver konfigurációs hiba: Hiányzó BASE_URL' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Nincs bejelentkezve' }, { status: 401 })
    }

    const body = await req.json()
    const { priceId, mode } = body

    if (!priceId) {
        return NextResponse.json({ error: 'Hiányzó Price ID' }, { status: 400 })
    }

    console.log(`Checkout indítása: ${user.email}, Price: ${priceId}`)

    // 3. Session létrehozása
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (err: any) {
    console.error('STRIPE API HIBA:', err)
    
    // FONTOS: Mindig JSON-t adunk vissza, még hiba esetén is!
    return NextResponse.json(
        { error: err.message || 'Ismeretlen szerver hiba' }, 
        { status: 500 }
    )
  }
}