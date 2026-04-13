import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user?.stripeCustomerId) return NextResponse.json({ error: 'No billing account' }, { status: 400 })

  const session = await createPortalSession(
    user.stripeCustomerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
  )

  return NextResponse.json({ url: session.url })
}
