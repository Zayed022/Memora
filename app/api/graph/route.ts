export const dynamic    = 'force-dynamic'
export const maxDuration = 60

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const GEMINI_KEY = process.env.GEMINI_API_KEY ?? ''
const GROQ_KEY   = process.env.GROQ_API_KEY   ?? ''

async function explainConnection(nodeA: string, nodeB: string, tagShared: string): Promise<string> {
  const prompt = `In 1 sentence (max 20 words), explain the conceptual connection between these two knowledge items:
"${nodeA}" and "${nodeB}"
They share the topic: "${tagShared}".
Be specific and insightful. No filler phrases.`

  if (GEMINI_KEY) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 60, temperature: 0.4 } }),
          signal: AbortSignal.timeout(5000) }
      )
      if (r.ok) { const d = await r.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '' }
    } catch {}
  }
  return ''
}

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [items, connections] = await Promise.all([
    prisma.item.findMany({
      where:   { userId: user.id, status: 'READY' },
      select:  { id: true, title: true, type: true, tags: true, summary: true, keyInsights: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take:    120,
    }),
    prisma.connection.findMany({
      where:   { userId: user.id },
      include: { items: { select: { itemId: true } } },
    }),
  ])

  // ── Build item nodes ────────────────────────────────────────────────────
  const nodes: any[] = items.map(item => ({
    id:          item.id,
    label:       item.title.length > 32 ? item.title.slice(0, 32) + '…' : item.title,
    fullTitle:   item.title,
    type:        item.type,
    tags:        item.tags,
    summary:     item.summary ?? '',
    keyInsights: item.keyInsights ?? [],
    size:        Math.min(10 + item.tags.length * 2.5, 28),
    color:       typeColor(item.type),
    createdAt:   item.createdAt.toISOString(),
    isTag:       false,
  }))

  // ── Build tag cluster nodes (min 2 shared items) ────────────────────────
  const tagMap = new Map<string, string[]>()
  items.forEach(item => item.tags.forEach(tag => {
    if (!tagMap.has(tag)) tagMap.set(tag, [])
    tagMap.get(tag)!.push(item.id)
  }))

  const tagNodes: any[] = []
  const tagEdges: any[] = []

  tagMap.forEach((itemIds, tag) => {
    if (itemIds.length < 2) return
    const tagId    = `tag:${tag}`
    const strength = Math.min(8 + itemIds.length * 1.5, 22)
    tagNodes.push({
      id: tagId, label: tag, fullTitle: tag,
      type: 'TAG', tags: [], summary: `${itemIds.length} items tagged "${tag}"`,
      keyInsights: [], size: strength, color: '#7340f5', isTag: true,
    })
    itemIds.forEach(iid => tagEdges.push({ source: iid, target: tagId, type: 'tag', weight: 0.6 }))
  })

  // ── AI-discovered connection edges ──────────────────────────────────────
  const connEdges: any[] = []
  connections.forEach(conn => {
    const ids = conn.items.map(ci => ci.itemId)
    for (let i = 0; i < ids.length - 1; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        connEdges.push({
          source: ids[i], target: ids[j],
          type:   'connection',
          label:  conn.title,
          weight: conn.strength ?? 0.8,
          description: conn.description ?? conn.title,
        })
      }
    }
  })

  // ── Cluster assignment (for visual grouping) ────────────────────────────
  // Each node gets a primary cluster based on its most common tag
  const topTagsGlobal = [...tagMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 8)
    .map(([tag]) => tag)

  const clusterColors: Record<string, string> = {}
  const CLUSTER_PALETTE = ['#7340f5','#3b82f6','#1D9E75','#f59e0b','#ef4444','#ec4899','#06b6d4','#84cc16']
  topTagsGlobal.forEach((tag, i) => { clusterColors[tag] = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length] })

  nodes.forEach(node => {
    const primaryTag = node.tags.find((t: string) => topTagsGlobal.includes(t))
    node.cluster      = primaryTag ?? 'other'
    node.clusterColor = primaryTag ? clusterColors[primaryTag] : '#928c82'
  })

  const allNodes = [...nodes, ...tagNodes]
  const allEdges = [...tagEdges, ...connEdges]

  return NextResponse.json({
    nodes: allNodes,
    edges: allEdges,
    clusters: topTagsGlobal.map(tag => ({
      id:    tag,
      label: tag,
      color: clusterColors[tag],
      count: tagMap.get(tag)?.length ?? 0,
    })),
    stats: {
      totalNodes:    allNodes.length,
      totalEdges:    allEdges.length,
      totalItems:    items.length,
      totalTopics:   tagMap.size,
      totalClusters: topTagsGlobal.length,
      aiConnections: connEdges.length,
    },
  })
}

// ── AI explain endpoint ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nodeATitle, nodeBTitle, sharedTag, type } = await req.json()

  if (type === 'explain_connection') {
    const explanation = await explainConnection(nodeATitle, nodeBTitle, sharedTag ?? '')

    if (!explanation) {
      return NextResponse.json({
        explanation: `Both "${nodeATitle}" and "${nodeBTitle}" share the topic "${sharedTag}" — they explore similar ideas from different angles.`
      })
    }

    return NextResponse.json({ explanation })
  }

  if (type === 'explain_node') {
    const { summary, tags, keyInsights } = await req.json()
    const prompt = `Given this knowledge item:
Title: "${nodeATitle}"
Summary: ${summary}
Tags: ${tags?.join(', ')}

Write 1 sentence (max 25 words) explaining what makes this knowledge item valuable to someone building expertise. Be specific.`

    let insight = ''
    if (GEMINI_KEY) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 80, temperature: 0.5 } }),
            signal: AbortSignal.timeout(8000) }
        )
        if (r.ok) { const d = await r.json(); insight = d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '' }
      } catch {}
    }

    return NextResponse.json({ explanation: insight || `This item on "${nodeATitle}" contributes to your understanding of ${tags?.[0] ?? 'this topic'}.` })
  }

  return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    ARTICLE:  '#3b82f6', NOTE: '#7340f5', YOUTUBE: '#ef4444',
    VOICE:    '#f59e0b', PDF: '#ec4899', BOOKMARK: '#1D9E75', PODCAST: '#06b6d4',
  }
  return map[type] ?? '#928c82'
}
