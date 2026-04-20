export const dynamic    = 'force-dynamic'
export const maxDuration = 30

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { answerFromKnowledge } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const question = body?.question?.trim()
  if (!question) return NextResponse.json({ error: 'No question provided' }, { status: 400 })

  // Get all items — READY first, then also include PROCESSING ones that have a title/url
  const items = await prisma.item.findMany({
    where:   { userId: user.id },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take:    30,
    select:  { title: true, summary: true, keyInsights: true, tags: true, createdAt: true, status: true, url: true },
  })

  const readyItems = items.filter(i => i.status === 'READY')

  if (readyItems.length === 0) {
    if (items.length > 0) {
      return NextResponse.json({
        answer: `You have ${items.length} item${items.length > 1 ? 's' : ''} saved but they're still being processed by AI. This usually takes 10-30 seconds. Please wait a moment and try again!`
      })
    }
    return NextResponse.json({
      answer: "You haven't saved any items yet. Click '+ Add', paste an article URL or write a note, and I'll analyse it. Then you can ask me anything about it!"
    })
  }

  try {
    const answer = await answerFromKnowledge(question, readyItems)
    return NextResponse.json({ answer })
  } catch (err: any) {
    console.error('[chat] AI error:', err?.message)
    return NextResponse.json({
      answer: 'The AI is temporarily unavailable. Please check your GEMINI_API_KEY is set correctly and try again.'
    })
  }
}
