export const dynamic = "force-dynamic"
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [clerkUser, user] = await Promise.all([
    currentUser(),
    prisma.user.findUnique({ where: { clerkId: userId } }),
  ])

  if (!user || !clerkUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { plan } = await req.json()
  const priceId = plan === 'TEAM'
    ? process.env.STRIPE_TEAM_PRICE_ID!
    : process.env.STRIPE_PRO_PRICE_ID!

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const base = process.env.NEXT_PUBLIC_APP_URL!

  const session = await createCheckoutSession(
    user.id, email, priceId,
    `${base}/dashboard/settings?upgraded=1`,
    `${base}/pricing`
  )

  return NextResponse.json({ url: session.url })
}
