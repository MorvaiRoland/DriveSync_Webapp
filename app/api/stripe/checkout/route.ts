// app/api/stripe/checkout/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any, // Maradjon az 'as any' a típus hiba elkerülése végett
  typescript: true,
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // JAVÍTÁS: Kivesszük a 'mode'-ot is a kérésből!
  const { priceId, mode, successUrl, cancelUrl } = await req.json()

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // JAVÍTÁS: A klienstől kapott módot használjuk. 
      // Ha a kliens 'payment'-et küld (Lifetime), akkor az lesz.
      // Ha 'subscription'-t (Pro), akkor az.
      mode: mode || 'subscription', 
      
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email, 
      
      // A webhookhoz elengedhetetlen azonosító
      client_reference_id: user.id, 
      
      metadata: {
        userId: user.id, 
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}