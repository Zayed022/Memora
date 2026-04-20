'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

const FORMATS = [
  { id: 'twitter_thread',  label: 'Twitter thread',   icon: '𝕏', desc: 'Hook + insights + CTA' },
  { id: 'blog_post',       label: 'Blog post',         icon: '✍️', desc: '600-800 words, SEO-ready' },
  { id: 'linkedin_post',   label: 'LinkedIn post',     icon: 'in', desc: 'Professional, engaging' },
  { id: 'email_newsletter',label: 'Newsletter section',icon: '✉️', desc: 'Subscriber-ready copy' },
  { id: 'summary_doc',     label: 'Summary doc',       icon: '📄', desc: 'Structured markdown doc' },
  { id: 'study_notes',     label: 'Study notes',       icon: '📚', desc: 'Learn & retain better' },
]

export default function WritePage() {
  const [topic, setTopic]     = useState('')
  const [format, setFormat]   = useState('twitter_thread')
  const [result, setResult]   = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [usedItems, setUsedItems] = useState(0)

  async function generate() {
    if (!topic.trim()) return toast.error('Enter a topic first')
    setLoading(true); setResult('')
    try {
      const res  = await fetch('/api/write', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), format }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.upgrade) {
          toast.error('Writing Assistant requires Pro')
          return
        }
        throw new Error(data.error)
      }
      setResult(data.content)
      setUsedItems(data.usedItems)
      toast.success(`Generated from ${data.usedItems} saved items!`)
    } catch (e: any) {
      toast.error(e.message ?? 'Something went wrong')
    } finally { setLoading(false) }
  }

  async function copy() {
    await navigator.clipboard.writeText(result)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1 mt-12">
          <h1 className="font-display text-3xl text-ink-900">AI writing assistant</h1>
          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">Pro</span>
        </div>
        <p className="text-ink-400 text-sm">Generate content using your saved knowledge. Your articles and notes power everything.</p>
      </div>

      {/* Format picker */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-ink-500 uppercase tracking-wide mb-2.5">Output format</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMATS.map(f => (
            <button key={f.id} onClick={() => setFormat(f.id)}
              className={cn('flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                format === f.id ? 'bg-ink-900 border-ink-900 text-ink-50' : 'bg-white border-ink-100 text-ink-600 hover:border-ink-300')}>
              <span className="text-lg w-6 text-center">{f.icon}</span>
              <div>
                <div className="text-xs font-medium leading-tight">{f.label}</div>
                <div className={cn('text-[10px] leading-tight', format === f.id ? 'text-ink-400' : 'text-ink-400')}>{f.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic input */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Topic or idea</label>
        <textarea value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. 'The power of spaced repetition for learning', 'Why second brains matter', 'My takeaways from product management research'…"
          rows={3}
          className="w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm text-ink-800 outline-none focus:border-violet-400 transition-colors resize-none" />
        <p className="text-xs text-ink-400 mt-1.5">AI will use your saved knowledge to enrich the content with real insights.</p>
      </div>

      <button onClick={generate} disabled={loading || !topic.trim()}
        className="w-full py-3.5 bg-ink-900 text-ink-50 rounded-xl text-sm font-medium hover:bg-ink-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
        {loading ? (
          <><div className="w-4 h-4 border-2 border-ink-400 border-t-ink-50 rounded-full animate-spin" />Generating…</>
        ) : (
          <><span>✦</span> Generate with my knowledge</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-ink-700">
              Generated · used {usedItems} saved items
            </div>
            <div className="flex gap-2">
              <button onClick={copy}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  copied ? 'bg-sage-500 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={generate}
                className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium hover:bg-violet-100 transition-colors">
                Regenerate
              </button>
            </div>
          </div>
          <div className="bg-white border border-ink-100 rounded-2xl p-5">
            <pre className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed font-sans">{result}</pre>
          </div>
        </div>
      )}

      {/* Upgrade prompt for free users */}
      <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">
        <div className="text-sm font-medium text-violet-900 mb-1">✦ Pro feature</div>
        <p className="text-sm text-violet-700 mb-3">The Writing Assistant is available on Pro and Team plans. It uses your entire knowledge base to create content that sounds like you — because it's based on what you've actually read.</p>
        <Link href="/pricing" className="inline-block px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  )
}
