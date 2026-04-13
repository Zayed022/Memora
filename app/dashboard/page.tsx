import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/auth/sign-in')

  // Upsert user
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email: '' },
  })

  const [items, connections, stats] = await Promise.all([
    prisma.item.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.connection.findMany({
      where: { userId: user.id },
      include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.item.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: true,
    }),
  ])

  return (
    <DashboardClient
      user={user}
      initialItems={JSON.parse(JSON.stringify(items))}
      initialConnections={JSON.parse(JSON.stringify(connections))}
      stats={JSON.parse(JSON.stringify(stats))}
    />
  )
}
