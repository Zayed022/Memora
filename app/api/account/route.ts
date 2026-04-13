export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 👇 REQUIRED to prevent build-time execution
export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.user.deleteMany({
    where: { clerkId: userId },
  })

  return NextResponse.json({ success: true })
}