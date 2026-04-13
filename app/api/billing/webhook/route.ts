export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendUpgradeConfirmationEmail } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId = session.metadata?.userId
      if (!userId) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const priceId = subscription.items.data[0].price.id
      const plan    = priceId === process.env.STRIPE_TEAM_PRICE_ID ? 'TEAM' : 'PRO'

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          plan:                 plan as any,
          stripeCustomerId:     session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      })

      if (session.customer_email) {
        sendUpgradeConfirmationEmail(session.customer_email, updated.name ?? '', plan).catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub  = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (!user) break

      if (sub.status === 'active') {
        const priceId = sub.items.data[0].price.id
        const plan    = priceId === process.env.STRIPE_TEAM_PRICE_ID ? 'TEAM' : 'PRO'
        await prisma.user.update({ where: { id: user.id }, data: { plan: plan as any } })
      } else if (['canceled', 'unpaid', 'past_due'].includes(sub.status)) {
        await prisma.user.update({ where: { id: user.id }, data: { plan: 'FREE' } })
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub  = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (!user) break
      await prisma.user.update({
        where: { id: user.id },
        data:  { plan: 'FREE', stripeSubscriptionId: null },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
