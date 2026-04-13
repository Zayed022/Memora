export const dynamic = "force-dynamic"
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const item = await prisma.item.findFirst({ where: { id: params.id, userId: user.id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ item })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.item.deleteMany({ where: { id: params.id, userId: user.id } })
  await prisma.user.update({ where: { id: user.id }, data: { itemCount: { decrement: 1 } } })

  return NextResponse.json({ success: true })
}
