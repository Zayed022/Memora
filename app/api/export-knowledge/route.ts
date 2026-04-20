export const dynamic    = 'force-dynamic'
export const maxDuration = 120

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  itemToMarkdown, sanitiseFilename, buildManifest,
  buildReadme, buildSemanticGraph, type ExportItem,
} from '@/lib/export/knowledge-exporter'

export async function GET(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const format = new URL(req.url).searchParams.get('format') ?? 'zip'

  // ── Fetch all user data ────────────────────────────────────────────────────
  const [rawItems, collections, highlights, connections, stats] = await Promise.all([
    prisma.item.findMany({
      where:   { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.collection.findMany({
      where:   { userId: user.id },
      include: { items: { include: { item: { select: { id: true, title: true, type: true, tags: true } } }, orderBy: { order: 'asc' } } },
    }),
    prisma.highlight.findMany({
      where:   { userId: user.id },
      include: { item: { select: { title: true, url: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.connection.findMany({
      where:   { userId: user.id },
      include: { items: { include: { item: { select: { id: true, title: true } } } } },
    }),
    prisma.userStats.findUnique({ where: { userId: user.id } }),
  ])

  const items: ExportItem[] = rawItems.map(i => ({
    id:          i.id,
    type:        i.type,
    title:       i.title,
    url:         i.url,
    summary:     i.summary,
    keyInsights: i.keyInsights,
    tags:        i.tags,
    rawContent:  i.rawContent,
    isFavorite:  i.isFavorite,
    createdAt:   i.createdAt,
    updatedAt:   i.updatedAt,
  }))

  if (format === 'json') {
    // ── JSON format ────────────────────────────────────────────────────────
    const manifest = buildManifest(items, collections, { id: user.id, email: user.email })
    return NextResponse.json({
      manifest,
      items: items.map(i => ({
        ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(),
      })),
      collections: collections.map(c => ({
        id: c.id, name: c.name, description: c.description,
        items: c.items.map(ci => ({ id: ci.item.id, title: ci.item.title })),
      })),
      highlights: highlights.map(h => ({
        text: h.text, note: h.note, color: h.color,
        itemTitle: h.item.title, itemUrl: h.item.url,
        createdAt: h.createdAt.toISOString(),
      })),
    }, {
      headers: {
        'Content-Disposition': `attachment; filename="memora-export-${Date.now()}.json"`,
        'Content-Type':        'application/json',
      },
    })
  }

  // ── ZIP format ─────────────────────────────────────────────────────────────
  // We build a ZIP manually using the ZIP spec (stored/deflated entries)
  // No external library needed — pure Node.js Buffer manipulation
  const manifest = buildManifest(items, collections, { id: user.id, email: user.email })
  const readme    = buildReadme(manifest, user.name ?? user.email)
  const graph     = buildSemanticGraph(items, connections)

  // ── Highlights markdown ────────────────────────────────────────────────────
  let highlightsMd = '# My Highlights\n\n'
  highlights.forEach(h => {
    highlightsMd += `## ${h.item.title}\n\n`
    highlightsMd += `> ${h.text}\n\n`
    if (h.note) highlightsMd += `*Note: ${h.note}*\n\n`
    if (h.item.url) highlightsMd += `[Source](${h.item.url})\n\n`
    highlightsMd += `---\n\n`
  })

  // ── Stats JSON ─────────────────────────────────────────────────────────────
  const statsData = {
    totalItems:      items.length,
    itemsByType:     manifest.itemsByType,
    topTopics:       manifest.tagCloud.slice(0, 20),
    streak:          user.streak,
    memberSince:     user.createdAt.toISOString(),
    estimatedHours:  Math.round((items.length * 7.67) / 60 * 10) / 10,
    knowledgeScore:  Math.min(items.length * 2 + user.streak * 5, 999),
    exportedAt:      new Date().toISOString(),
  }

  // ── Collections markdown ───────────────────────────────────────────────────
  const collectionFiles: Record<string, string> = {}
  collections.forEach(col => {
    let md  = `# ${col.emoji ?? '📁'} ${col.name}\n\n`
    if (col.description) md += `${col.description}\n\n`
    md += `**${col.items.length} items**\n\n`
    col.items.forEach((ci, i) => {
      md += `${i + 1}. ${ci.item.title}${ci.item.tags?.length ? ` (${ci.item.tags.slice(0, 2).join(', ')})` : ''}\n`
    })
    collectionFiles[`collections/${sanitiseFilename(col.name)}.md`] = md
  })

  // ── Group items by month ───────────────────────────────────────────────────
  const itemFiles: Record<string, string> = {}
  items.forEach(item => {
    const month = item.createdAt.toISOString().slice(0, 7)
    const slug  = sanitiseFilename(item.title)
    const key   = `items/${month}/${slug}-${item.id.slice(-6)}.md`
    itemFiles[key] = itemToMarkdown(item)
  })

  // ── Build ZIP ──────────────────────────────────────────────────────────────
  const zipEntries: Record<string, string> = {
    'README.md':                  readme,
    'manifest.json':              JSON.stringify(manifest, null, 2),
    'graph/semantic-graph.json':  JSON.stringify(graph, null, 2),
    'graph/connections.json':     JSON.stringify(connections.map(c => ({
      id: c.id, title: c.title, description: c.description, strength: c.strength,
      items: c.items.map((ci: any) => ({ id: ci.item?.id, title: ci.item?.title })),
    })), null, 2),
    'highlights.md':              highlightsMd,
    'stats.json':                 JSON.stringify(statsData, null, 2),
    ...collectionFiles,
    ...itemFiles,
  }

  const zipBuffer = buildZip(zipEntries)
const body = new Uint8Array(zipBuffer)

return new NextResponse(body, {
  headers: {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename="memora-knowledge-${user.id.slice(-8)}-${new Date().toISOString().split('T')[0]}.zip"`,
    'Content-Length': zipBuffer.byteLength.toString(),
    'X-Export-Items': items.length.toString(),
    'X-Export-Format': 'memora-v3',
  },
})
}

// ── Pure ZIP builder (no external library) ────────────────────────────────────
function buildZip(entries: Record<string, string>): Buffer {
  const parts: Buffer[] = []
  const centralDir: Buffer[] = []
  let offset = 0

  for (const [filename, content] of Object.entries(entries)) {
    const fileData    = Buffer.from(content, 'utf-8')
    const nameBuffer  = Buffer.from(filename, 'utf-8')
    const crc         = crc32(fileData)
    const now         = new Date()
    const dosDate     = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
    const dosTime     = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)

    // Local file header
    const localHeader = Buffer.allocUnsafe(30 + nameBuffer.length)
    localHeader.writeUInt32LE(0x04034b50, 0)   // signature
    localHeader.writeUInt16LE(20,  4)           // version needed
    localHeader.writeUInt16LE(0,   6)           // flags
    localHeader.writeUInt16LE(0,   8)           // compression (stored)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(fileData.length, 18) // compressed size
    localHeader.writeUInt32LE(fileData.length, 22) // uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26)
    localHeader.writeUInt16LE(0, 28)            // extra field length
    nameBuffer.copy(localHeader, 30)

    parts.push(localHeader, fileData)

    // Central directory entry
    const cdEntry = Buffer.allocUnsafe(46 + nameBuffer.length)
    cdEntry.writeUInt32LE(0x02014b50, 0)        // signature
    cdEntry.writeUInt16LE(20,  4)               // version made by
    cdEntry.writeUInt16LE(20,  6)               // version needed
    cdEntry.writeUInt16LE(0,   8)               // flags
    cdEntry.writeUInt16LE(0,   10)              // compression
    cdEntry.writeUInt16LE(dosTime, 12)
    cdEntry.writeUInt16LE(dosDate, 14)
    cdEntry.writeUInt32LE(crc, 16)
    cdEntry.writeUInt32LE(fileData.length, 20)
    cdEntry.writeUInt32LE(fileData.length, 24)
    cdEntry.writeUInt16LE(nameBuffer.length, 28)
    cdEntry.writeUInt16LE(0, 30)                // extra length
    cdEntry.writeUInt16LE(0, 32)                // comment length
    cdEntry.writeUInt16LE(0, 34)                // disk start
    cdEntry.writeUInt16LE(0, 36)                // internal attr
    cdEntry.writeUInt32LE(0, 38)                // external attr
    cdEntry.writeUInt32LE(offset, 42)           // local header offset
    nameBuffer.copy(cdEntry, 46)

    centralDir.push(cdEntry)
    offset += localHeader.length + fileData.length
  }

  const cdBuffer      = Buffer.concat(centralDir)
  const eocd          = Buffer.allocUnsafe(22)
  eocd.writeUInt32LE(0x06054b50, 0)             // signature
  eocd.writeUInt16LE(0, 4)                      // disk number
  eocd.writeUInt16LE(0, 6)                      // cd start disk
  eocd.writeUInt16LE(centralDir.length, 8)      // entries on disk
  eocd.writeUInt16LE(centralDir.length, 10)     // total entries
  eocd.writeUInt32LE(cdBuffer.length, 12)       // cd size
  eocd.writeUInt32LE(offset, 16)                // cd offset
  eocd.writeUInt16LE(0, 20)                     // comment length

  return Buffer.concat([...parts, cdBuffer, eocd])
}

function crc32(buf: Buffer): number {
  let crc = 0xFFFFFFFF
  for (const byte of buf) {
    crc ^= byte
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}
