import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { answerFromKnowledge } from '@/lib/ai'
import { rateLimitAiChat } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Free users: 10 AI queries per 30 days
  const rl = await rateLimitAiChat(user.id, user.plan).catch(() => ({
    allowed: true, remaining: 99, resetAt: 0
  }))

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Monthly AI query limit reached. Upgrade to Pro for unlimited queries.', upgradeRequired: true },
      { status: 429 }
    )
  }

  const { question } = await req.json()
  if (!question?.trim()) return NextResponse.json({ error: 'No question provided' }, { status: 400 })

  const items = await prisma.item.findMany({
    where:   { userId: user.id, status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    25,
    select:  { title: true, summary: true, keyInsights: true, tags: true, createdAt: true },
  })

  if (items.length === 0) {
    return NextResponse.json({
      answer: "You don't have any processed items yet. Save a few articles or notes first — then I can answer questions about them!"
    })
  }

  const safeItems = items.map(item => ({
    ...item,
    summary: item.summary ?? ""
  }))
  
  const answer = await answerFromKnowledge(question, safeItems)

  return NextResponse.json({ answer, remaining: rl.remaining })
}
