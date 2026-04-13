export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWeeklyDigest } from '@/lib/ai'

// Vercel cron: every Monday at 8am UTC
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const proUsers = await prisma.user.findMany({
    where: { plan: { in: ['PRO', 'TEAM'] } },
    select: { id: true, name: true, email: true },
  })

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)

  let processed = 0

  for (const user of proUsers) {
    try {
      const rawItems = await prisma.item.findMany({
        where: { userId: user.id, status: 'READY', createdAt: { gte: weekStart } },
        select: { title: true, summary: true, tags: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })

      if (rawItems.length === 0) continue

      // Normalise: replace null summary with empty string so types match
      const items = rawItems.map(item => ({
        ...item,
        summary: item.summary ?? '',
      }))

      const content = await generateWeeklyDigest(items, user.name ?? 'there')

      await prisma.weeklyDigest.create({
        data: { userId: user.id, content, weekStart },
      })

      processed++

      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.error(`Digest failed for user ${user.id}:`, err)
    }
  }

  return NextResponse.json({ success: true, processed, total: proUsers.length })
}