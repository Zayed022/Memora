import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Memora vs Notion vs Readwise vs Obsidian — Full Comparison',
  description: 'See why Memora beats Notion, Readwise, and Obsidian for AI-powered knowledge management. Zero manual organisation, instant AI answers, spaced repetition.',
}

const ROWS = [
  { feature: 'Auto-summarise on save',         memora: true,  notion: false, readwise: false, obsidian: false },
  { feature: 'AI Q&A from your notes',         memora: true,  notion: false, readwise: false, obsidian: false },
  { feature: 'YouTube video summaries',        memora: true,  notion: false, readwise: false, obsidian: false },
  { feature: 'Zero manual organisation',       memora: true,  notion: false, readwise: false, obsidian: false },
  { feature: 'AI connection discovery',        memora: true,  notion: false, readwise: false, obsidian: 'plugin' },
  { feature: 'Spaced repetition built-in',     memora: true,  notion: false, readwise: true,  obsidian: 'plugin' },
  { feature: 'Weekly digest email',            memora: true,  notion: false, readwise: true,  obsidian: false },
  { feature: 'Knowledge graph visualisation',  memora: true,  notion: false, readwise: false, obsidian: true },
  { feature: 'AI writing assistant',           memora: true,  notion: 'ai+',  readwise: false, obsidian: false },
  { feature: 'Browser extension',              memora: true,  notion: true,  readwise: true,  obsidian: false },
  { feature: 'Works on mobile (PWA)',          memora: true,  notion: true,  readwise: true,  obsidian: 'paid' },
  { feature: 'Offline access',                 memora: false, notion: true,  readwise: false, obsidian: true },
  { feature: 'Starts free',                    memora: true,  notion: true,  readwise: false, obsidian: true },
  { feature: 'Pro price',                      memora: '$12', notion: '$15', readwise: '$8',  obsidian: '$0' },
]

function Cell({ val }: { val: boolean | string }) {
  if (val === true)  return <span className="text-sage-600 font-bold text-base">✓</span>
  if (val === false) return <span className="text-ink-300">✗</span>
  return <span className="text-xs text-amber-600 font-medium">{val}</span>
}

export default function VsPage() {
  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="border-b border-ink-100 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-ink-900">mem<span className="text-violet-500">ora</span></Link>
        <Link href="/auth/sign-up" className="px-4 py-2 bg-ink-900 text-ink-50 rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">Start free →</Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl text-ink-900 mb-4">Memora vs the world</h1>
          <p className="text-lg text-ink-500 max-w-xl mx-auto">
            Every other knowledge tool makes you do the work. Memora does it for you — automatically.
          </p>
        </div>

        {/* Key differentiator */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 mb-8">
          <h2 className="font-display text-2xl text-violet-900 mb-3">The one thing that changes everything</h2>
          <p className="text-violet-800 leading-relaxed">
            Notion, Obsidian, and Readwise all require you to read, tag, organise, and connect your knowledge manually.
            Memora is the only tool that does all of that automatically the moment you save something.
            AI reads the full content, writes the summary, extracts insights, tags it, and connects it to everything
            else you've saved — in under 20 seconds, with zero input from you.
          </p>
        </div>

        {/* Comparison table */}
        <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden mb-12">
          <div className="grid grid-cols-5 border-b border-ink-100">
            <div className="p-4 text-xs font-medium text-ink-400 uppercase tracking-wide">Feature</div>
            <div className="p-4 text-center bg-violet-50">
              <div className="text-sm font-bold text-violet-700">Memora</div>
            </div>
            <div className="p-4 text-center"><div className="text-sm font-medium text-ink-600">Notion</div></div>
            <div className="p-4 text-center"><div className="text-sm font-medium text-ink-600">Readwise</div></div>
            <div className="p-4 text-center"><div className="text-sm font-medium text-ink-600">Obsidian</div></div>
          </div>
          {ROWS.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-5 border-b border-ink-50 last:border-0 ${i % 2 === 1 ? 'bg-ink-50/30' : ''}`}>
              <div className="p-3 text-sm text-ink-700">{row.feature}</div>
              <div className="p-3 text-center bg-violet-50/30"><Cell val={row.memora} /></div>
              <div className="p-3 text-center"><Cell val={row.notion} /></div>
              <div className="p-3 text-center"><Cell val={row.readwise} /></div>
              <div className="p-3 text-center"><Cell val={row.obsidian} /></div>
            </div>
          ))}
        </div>

        {/* Head-to-head sections */}
        <div className="space-y-6 mb-12">
          {[
            {
              vs: 'Notion', color: '#928c82',
              summary: 'Notion is a powerful workspace tool. But it is designed for teams to organise projects — not individuals to retain knowledge. Every item in Notion requires manual processing: title, tags, properties, links. Memora does all of that automatically.',
              winText: 'Memora wins because it works without effort. Notion is a blank canvas you have to build yourself.',
            },
            {
              vs: 'Readwise', color: '#f59e0b',
              summary: 'Readwise is excellent for resurface highlights from books. But it only works with content you have already highlighted — it cant read and summarise new articles. It just not only answer questions from your knowledge base or discover connections.',
              winText: 'Memora wins on capture. Readwise requires highlights already exist. Memora works from any URL, note, or video.',
            },
            {
              vs: 'Obsidian', color: '#3b82f6',
              summary: 'Obsidian is a powerful local-first tool for power users. Building a great Obsidian vault takes hundreds of hours of setup. Memora achieves the same outcome — connected, searchable knowledge — automatically, with zero setup.',
              winText: 'Memora wins on accessibility. Obsidian rewards patience. Memora rewards saving things.',
            },
          ].map(s => (
            <div key={s.vs} className="bg-white border border-ink-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="font-display text-2xl text-ink-900">Memora vs {s.vs}</h2>
              </div>
              <p className="text-ink-600 leading-relaxed mb-3">{s.summary}</p>
              <div className="flex items-start gap-2 px-3 py-2 bg-sage-50 border border-sage-100 rounded-lg">
                <span className="text-sage-500 font-bold mt-0.5">→</span>
                <p className="text-sm text-sage-800 font-medium">{s.winText}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-ink-900 rounded-3xl p-10 text-center">
          <h2 className="font-display text-4xl text-ink-50 mb-3">Stop organising. Start knowing.</h2>
          <p className="text-ink-400 mb-8">Memora does the work you've been putting off. Free to start, takes 30 seconds.</p>
          <Link href="/auth/sign-up" className="inline-block px-10 py-4 bg-violet-500 text-white rounded-xl text-base font-medium hover:bg-violet-400 transition-colors">
            Try Memora free →
          </Link>
        </div>
      </main>
    </div>
  )
}
