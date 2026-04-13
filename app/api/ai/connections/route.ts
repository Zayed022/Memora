import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findConnections } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const items = await prisma.item.findMany({
    where: { userId: user.id, status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true, title: true, summary: true, tags: true },
  })

  if (items.length < 2) {
    return NextResponse.json({ connections: [], message: 'Need at least 2 items' })
  }

  const safeItems = items.map(item => ({
    ...item,
    summary: item.summary ?? ""
  }))
  
  const aiConnections = await findConnections(safeItems)

  // Delete old connections and save new ones
  await prisma.connection.deleteMany({ where: { userId: user.id } })

  const saved = await Promise.all(
    aiConnections.map(async (conn) => {
      const validIds = conn.itemIds.filter(id => items.some(i => i.id === id))
      if (validIds.length < 2) return null

      const connection = await prisma.connection.create({
        data: {
          userId: user.id,
          title: conn.title,
          description: conn.description,
          strength: conn.strength,
          items: {
            create: validIds.map(itemId => ({ itemId })),
          },
        },
        include: { items: { include: { item: true } } },
      })
      return connection
    })
  )

  const connections = saved.filter(Boolean)
  return NextResponse.json({ connections })
}
