export const dynamic = "force-dynamic"
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { summariseItem, extractFromUrl } from '@/lib/ai'
import { uploadFile, buildS3Key } from '@/lib/s3'
import { rateLimitItemCreate } from '@/lib/ratelimit'
import { PLAN_LIMITS } from '@/types'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const type   = searchParams.get('type')
  const tag    = searchParams.get('tag')
  const cursor = searchParams.get('cursor')
  const limit  = 20

  const items = await prisma.item.findMany({
    where: {
      userId: user.id,
      ...(type ? { type: type as any } : {}),
      ...(tag  ? { tags: { has: tag } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = items.length > limit
  return NextResponse.json({
    items:      hasMore ? items.slice(0, limit) : items,
    nextCursor: hasMore ? items[limit - 1].id   : null,
  })
}

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Rate limit: 60 items per hour per user
  const rl = await rateLimitItemCreate(user.id).catch(() => ({ allowed: true, remaining: 99, resetAt: 0 }))
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'X-RateLimit-Reset': String(rl.resetAt) } }
    )
  }

  // Plan limit
  const planLimit = PLAN_LIMITS[user.plan].items
  if (user.itemCount >= planLimit) {
    return NextResponse.json(
      { error: 'Plan limit reached. Upgrade to Pro for unlimited items.' },
      { status: 403 }
    )
  }

  const form    = await req.formData()
  const type    = form.get('type')    as string
  const url     = form.get('url')     as string | null
  const title   = form.get('title')   as string | null
  const content = form.get('content') as string | null
  const file    = form.get('file')    as File   | null
  const audio   = form.get('audio')   as File   | null

  let fileKey:  string | null = null
  let audioKey: string | null = null

  // Upload files to S3
  if (file && file.size > 0) {
    try {
      const bytes = Buffer.from(await file.arrayBuffer())
      const key   = buildS3Key(user.id, 'pdf', file.name)
      await uploadFile(key, bytes, file.type)
      fileKey = key
    } catch (e) {
      console.error('[upload] file upload failed:', e)
    }
  }

  if (audio && audio.size > 0) {
    try {
      const bytes = Buffer.from(await audio.arrayBuffer())
      const key   = buildS3Key(user.id, 'audio', 'memo.webm')
      await uploadFile(key, bytes, audio.type)
      audioKey = key
    } catch (e) {
      console.error('[upload] audio upload failed:', e)
    }
  }

  // Create item immediately in PROCESSING state
  const item = await prisma.item.create({
    data: {
      userId: user.id,
      type:   type as any,
      title:  title ?? url ?? 'Processing…',
      url,
      rawContent: content,
      fileKey,
      audioKey,
      status: 'PROCESSING',
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data:  { itemCount: { increment: 1 } },
  })

  // AI processing — fire and forget (in prod: push to Inngest / BullMQ)
  processItemAsync(item.id, type, url ?? '', title ?? '', content ?? '').catch(console.error)

  return NextResponse.json({ item }, { status: 201 })
}

async function processItemAsync(
  itemId:  string,
  type:    string,
  url:     string,
  title:   string,
  content: string
) {
  try {
    let rawContent = content

    if (type === 'ARTICLE' && url) {
      rawContent = await extractFromUrl(url)
    }

    const ai = await summariseItem(rawContent || title, type, url || undefined)

    await prisma.item.update({
      where: { id: itemId },
      data: {
        title:       ai.title       || title || 'Untitled',
        summary:     ai.summary,
        keyInsights: ai.keyInsights,
        tags:        ai.tags,
        rawContent:  rawContent?.slice(0, 50_000),
        status:      'READY',
      },
    })
  } catch (err) {
    console.error('[processItem] failed:', err)
    await prisma.item.update({
      where: { id: itemId },
      data:  { status: 'FAILED' },
    })
  }
}
