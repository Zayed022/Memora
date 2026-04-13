/**
 * lib/ai.ts — 100% FREE AI (Google Gemini + Groq, no Anthropic)
 *
 * Primary:  Google Gemini 2.5 Flash  → GEMINI_API_KEY (aistudio.google.com)
 * Fallback: Groq Llama 3.3 70B       → GROQ_API_KEY   (console.groq.com)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ''
const GROQ_API_KEY   = process.env.GROQ_API_KEY   ?? ''

// ─── Core call with Gemini → Groq fallback ───────────────────────────────────

async function callAI(prompt: string, systemPrompt?: string, maxTokens = 1024): Promise<string> {
  // 1. Try Gemini Flash-Lite first (1000 req/day free)
  if (GEMINI_API_KEY) {
    const models = [
      'gemini-2.5-flash-lite-preview-06-17',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
    ]
    for (const model of models) {
      try {
        return await callGemini(prompt, systemPrompt, maxTokens, model)
      } catch (err: any) {
        const rateLimited = err?.status === 429 || String(err?.message).includes('429') || String(err?.message).toLowerCase().includes('quota')
        if (!rateLimited) throw err
        console.warn(`[ai] Gemini ${model} rate limited, trying next model…`)
      }
    }
  }

  // 2. Fallback to Groq (free Llama 3.3 70B)
  if (GROQ_API_KEY) {
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
    for (const model of models) {
      try {
        return await callGroq(prompt, systemPrompt, maxTokens, model)
      } catch (err: any) {
        const rateLimited = err?.status === 429 || String(err?.message).includes('rate_limit')
        if (!rateLimited) throw err
        console.warn(`[ai] Groq ${model} rate limited, trying next model…`)
      }
    }
  }

  throw new Error('AI_UNAVAILABLE')
}

async function callGemini(prompt: string, systemPrompt: string | undefined, maxTokens: number, model: string): Promise<string> {
  const body: any = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 },
  }
  if (systemPrompt) {
    body.system_instruction = { parts: [{ text: systemPrompt }] }
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const e: any = new Error(err?.error?.message ?? `Gemini HTTP ${res.status}`)
    e.status = res.status
    throw e
  }

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callGroq(prompt: string, systemPrompt: string | undefined, maxTokens: number, model: string): Promise<string> {
  const messages: any[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.3 }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const e: any = new Error(err?.error?.message ?? `Groq HTTP ${res.status}`)
    e.status = res.status
    throw e
  }

  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

// ─── Feature functions ────────────────────────────────────────────────────────

export async function summariseItem(content: string, type: string, url?: string): Promise<{
  title: string; summary: string; keyInsights: string[]; tags: string[]
}> {
  const FALLBACK = {
    title: url ? (() => { try { return new URL(url).hostname } catch { return 'Untitled' } })() : 'Untitled',
    summary: content.slice(0, 200),
    keyInsights: [] as string[],
    tags: [] as string[],
  }

  try {
    const prompt = `Analyse this ${type.toLowerCase()} and extract structured knowledge.
${url ? `\nURL: ${url}` : ''}

Content:
${content.slice(0, 6000)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "concise descriptive title (max 80 chars)",
  "summary": "2-3 sentence summary of the core idea and why it matters",
  "keyInsights": ["specific actionable insight 1", "insight 2", "insight 3"],
  "tags": ["lowercase-tag1", "tag2", "tag3"]
}`

    const raw  = await callAI(prompt, undefined, 600)
    const json = raw.replace(/```json\n?|\n?```/g, '').trim()

    // Find JSON object in response even if there's surrounding text
    const match = json.match(/\{[\s\S]*\}/)
    if (!match) return FALLBACK

    return JSON.parse(match[0])
  } catch (err: any) {
    if (err?.message === 'AI_UNAVAILABLE') return FALLBACK
    console.error('[ai] summariseItem failed:', err?.message)
    return FALLBACK
  }
}

export async function answerFromKnowledge(
  question: string,
  items: Array<{ title: string; summary: string; keyInsights: string[]; tags: string[]; createdAt: Date }>
): Promise<string> {
  if (items.length === 0) {
    return "You don't have any saved items yet. Save some articles or notes first!"
  }

  const context = items.slice(0, 15).map((item, i) =>
    `[${i + 1}] "${item.title}" (saved ${new Date(item.createdAt).toLocaleDateString()})\n` +
    `Summary: ${item.summary ?? 'No summary'}\n` +
    (item.keyInsights?.length ? `Key insights: ${item.keyInsights.join(' • ')}` : '')
  ).join('\n\n')

  const system = `You are an AI assistant with access to the user's personal knowledge base.
Answer their question using ONLY the context provided. Be specific, cite items by [number].
Be concise — 2-4 sentences max unless more detail is clearly needed.
If the knowledge base lacks sufficient info, say so and suggest what they might want to save.`

  try {
    return await callAI(`Knowledge base:\n${context}\n\nQuestion: ${question}`, system, 500)
  } catch (err: any) {
    if (err?.message === 'AI_UNAVAILABLE') {
      return 'AI is temporarily unavailable. Please check your GEMINI_API_KEY in .env.local and restart the server.'
    }
    throw err
  }
}

export async function generateWeeklyDigest(
  items: Array<{ title: string; summary: string; tags: string[]; createdAt: Date }>,
  userName: string
): Promise<string> {
  const itemList = items.map(i => `• "${i.title}" [${i.tags.join(', ')}]`).join('\n')

  const prompt = `Generate a warm, insightful weekly digest for ${userName} based on what they saved this week.

Items:
${itemList}

Write 3-4 sentences covering: the recurring theme, one surprising connection, and one actionable nudge.
Tone: warm and intelligent, like a thoughtful friend. No bullet points — flowing prose only.`

  try {
    return await callAI(prompt, undefined, 400)
  } catch {
    return `You saved ${items.length} items this week. Keep building that knowledge base!`
  }
}

export async function findConnections(
  items: Array<{ id: string; title: string; summary: string; tags: string[] }>
): Promise<Array<{ itemIds: string[]; title: string; description: string; strength: number }>> {
  if (items.length < 2) return []

  const itemList = items.slice(0, 20).map((i, idx) =>
    `[${idx}:${i.id}] "${i.title}" — ${i.summary ?? i.title}`
  ).join('\n')

  const prompt = `Find non-obvious conceptual connections between these knowledge items.

Items:
${itemList}

Return ONLY a valid JSON array (no markdown):
[{"itemIds":["id1","id2"],"title":"Connection name","description":"One sentence explanation","strength":0.85}]

Rules: 3-5 connections max, strength ≥ 0.65 only, use EXACT IDs from brackets, return [] if none found.`

  try {
    const raw   = await callAI(prompt, undefined, 600)
    const match = raw.replace(/```json\n?|\n?```/g, '').match(/\[[\s\S]*\]/)
    if (!match) return []
    return JSON.parse(match[0])
  } catch {
    return []
  }
}

export async function extractFromUrl(url: string): Promise<string> {
  // Jina Reader — completely free, no API key needed
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text', 'X-Timeout': '10' },
      signal: AbortSignal.timeout(12_000),
    })
    if (res.ok) return (await res.text()).slice(0, 50_000)
  } catch (e) {
    console.warn('[ai] Jina extraction failed:', e)
  }

  // Fallback: direct fetch + strip HTML
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Memora/1.0)' },
      signal: AbortSignal.timeout(8_000),
    })
    if (res.ok) {
      return (await res.text())
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 50_000)
    }
  } catch (e) {
    console.warn('[ai] Direct fetch failed:', e)
  }

  return ''
}