export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lazy import — prevents Prisma from running at build time
    const { prisma } = await import('@/lib/prisma')
    await prisma.user.deleteMany({ where: { clerkId: userId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account] DELETE error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}