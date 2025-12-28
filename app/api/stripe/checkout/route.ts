// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any, // <--- ÍGY
  typescript: true,
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { priceId, successUrl, cancelUrl } = await req.json()

  // Eldöntjük, hogy ez egyszeri fizetés (Lifetime) vagy előfizetés (Pro)
  // A lifetime price ID-dat ismerjük a konstansból
  const isLifetime = priceId === 'price_1SijxIRbHGQdHUF48ulonZdP'; // Cseréld a sajátodra!

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // + google_pay, apple_pay amit beállítottál
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isLifetime ? 'payment' : 'subscription', // FONTOS!
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email, // Automatikusan kitölti az emailt a Stripe-on
      
      // EZ A LEGFONTOSABB SOR:
      // Itt kötjük össze a Stripe-ot a Supabase Userrel
      client_reference_id: user.id, 
      
      metadata: {
        userId: user.id, // Biztonsági tartalék
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}