'use client'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const DEMO_ITEMS = [
  { id: '1', type: 'ARTICLE',  title: 'The Feynman Technique: Learn Anything Faster', summary: 'Richard Feynman\'s learning method involves teaching concepts in simple language to identify gaps. Studies show this technique improves retention by 40-60% compared to passive reading.', tags: ['learning','productivity','feynman'], keyInsights: ['Teach it simply to expose gaps','Identify gaps and return to source','Use analogies for complex ideas'], time: '2h ago', status: 'READY' },
  { id: '2', type: 'YOUTUBE',  title: 'How Spaced Repetition Changes the Brain — Andrew Huberman', summary: 'Neuroscientist explains how reviewing information at spaced intervals physically changes synaptic strength. Gap effect: reviewing right before forgetting creates 3× stronger memory traces.', tags: ['neuroscience','memory','learning'], keyInsights: ['Space reviews by 1d, 3d, 7d, 21d','Emotional salience boosts retention','Sleep consolidates reviewed memories'], time: '5h ago', status: 'READY' },
  { id: '3', type: 'NOTE',     title: 'Q2 planning — key decisions and rationale', summary: 'Notes from Q2 planning covering product roadmap, engineering capacity, and go-to-market for enterprise tier.', tags: ['work','planning','strategy'], keyInsights: ['Focus on activation metric first','Enterprise needs 3 reference customers','Weekly growth target: 15% WoW'], time: '1d ago', status: 'READY' },
  { id: '4', type: 'ARTICLE',  title: 'Why Most Second Brains Fail Within 90 Days', summary: 'Research across 2,000 users of knowledge management apps shows 78% abandon their system within 3 months due to "organisation overhead".', tags: ['second-brain','productivity','research'], keyInsights: ['Organisation should be automatic','Review friction kills habits','Daily value is essential'], time: '1d ago', status: 'READY' },
  { id: '5', type: 'YOUTUBE',  title: 'Naval Ravikant on Reading and Knowledge Compounding', summary: 'Naval explains how reading 1 hour per day compounds into deep domain expertise. Reading without retrieval is like investing without compound interest.', tags: ['reading','investing','knowledge'], keyInsights: ['1hr/day compounds in 7 years','Retrieval is the ROI on reading','Choose books over tweets'], time: '2d ago', status: 'READY' },
  { id: '6', type: 'ARTICLE',  title: 'Building AI Products That Actually Retain Users', summary: 'Products with daily habit loops retain 4× more users than feature-heavy alternatives. The hook: immediate value, daily return trigger.', tags: ['ai','product','retention'], keyInsights: ['Daily value beats feature depth','First-use value critical','Habit triggers must feel natural'], time: '3d ago', status: 'READY' },
]

const DEMO_CONNECTIONS = [
  { title: 'Spaced repetition ↔ Feynman Technique: Both leverage the gap effect for retention' },
  { title: 'Second brain failure ↔ AI product retention: Same root cause — insufficient daily value' },
  { title: 'Naval reading ↔ Knowledge compounding: Reading without retrieval is wasted investment' },
]

type DemoPlan = 'FREE' | 'PRO' | 'TEAM'

const PLAN_FEATURES: Record<DemoPlan, string[]> = {
  FREE:  ['50 items', '10 AI queries/mo', 'Basic search'],
  PRO:   ['Unlimited items', 'Unlimited AI', 'Knowledge graph', 'Weekly digest', 'Spaced repetition', 'YouTube summaries', 'Writing assistant', 'Data export'],
  TEAM:  ['Everything in Pro', 'Shared knowledge base', 'Team memory assistant', 'Admin dashboard', 'API access'],
}

const PLAN_COLORS: Record<DemoPlan, string> = {
  FREE: '#928c82', PRO: '#7340f5', TEAM: '#1D9E75',
}

const TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-50 text-blue-700',
  NOTE:    'bg-violet-50 text-violet-700',
  YOUTUBE: 'bg-red-50 text-red-700',
}

export default function DemoPage() {
  const [plan, setPlan]   = useState<DemoPlan>('PRO')
  const [input, setInput] = useState('')
  const [aiMsg, setAiMsg] = useState('I\'ve indexed all 6 of your saved items. Ask me anything — I\'ll answer from your own knowledge base.')
  const [typing, setTyping] = useState(false)

  const visibleItems = plan === 'FREE' ? DEMO_ITEMS.slice(0, 3) : DEMO_ITEMS

  function simulateAsk() {
    if (!input.trim()) return
    const q = input; setInput(''); setTyping(true)
    setTimeout(() => {
      setAiMsg(`Based on your saved items about learning and productivity: you've been building a strong foundation around spaced repetition (items [1] and [2]) and habit formation (items [4] and [6]). The core thread is that knowledge without active retrieval doesn't compound — which is exactly what Memora solves for you.`)
      setTyping(false)
    }, 1800)
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef]">
      {/* ── Top banner — plan switcher ──────────────────────────────── */}
      <div className="bg-ink-900 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/60 uppercase tracking-wide">Demo mode</span>
          <span className="text-white/30">·</span>
          <span className="text-sm font-medium">Simulating plan:</span>
          <div className="flex gap-1.5">
            {(['FREE', 'PRO', 'TEAM'] as DemoPlan[]).map(p => (
              <button key={p} onClick={() => setPlan(p)}
                className={cn('px-3 py-1 rounded-full text-xs font-semibold transition-all',
                  plan === p ? 'text-white' : 'bg-white/10 text-white/50 hover:bg-white/20')}
                style={{ background: plan === p ? PLAN_COLORS[p] : undefined }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/40">
            {PLAN_FEATURES[plan].slice(0, 3).join(' · ')}
            {PLAN_FEATURES[plan].length > 3 && ` +${PLAN_FEATURES[plan].length - 3} more`}
          </span>
          <Link href="/auth/sign-up"
            className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs font-medium hover:bg-violet-400 transition-colors whitespace-nowrap">
            Start free →
          </Link>
        </div>
      </div>

      <div className="flex h-[calc(100vh-52px)]">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="w-56 bg-white border-r border-ink-100 flex flex-col py-4 shrink-0">
          <div className="px-4 mb-5">
            <div className="font-display text-xl text-ink-900">mem<span className="text-violet-500">ora</span></div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-full" style={{ background: PLAN_COLORS[plan] }} />
              <span className="text-[10px] font-medium" style={{ color: PLAN_COLORS[plan] }}>{plan} demo</span>
            </div>
          </div>
          <nav className="px-3 space-y-0.5">
            {[
              { label: 'All items',     icon: '⊞', active: true  },
              { label: 'Collections',   icon: '❑', active: false },
              { label: 'Highlights',    icon: '✎', active: false },
              { label: 'Knowledge graph',icon:'◎', active: false, proOnly: true },
              { label: 'Review queue',  icon: '↻', active: false, proOnly: true },
              { label: 'AI coach',      icon: '🧠', active: false, proOnly: true },
              { label: 'AI writer',     icon: '✍️', active: false, proOnly: true },
              { label: 'Digest',        icon: '◇', active: false, proOnly: true },
            ].map(n => {
              const locked = n.proOnly && plan === 'FREE'
              return (
                <div key={n.label}
                  className={cn('flex items-center justify-between px-3 py-2.5 rounded-xl text-sm',
                    n.active ? 'bg-ink-900 text-ink-50 font-medium' :
                    locked ? 'text-ink-300' :
                    'text-ink-500 hover:bg-ink-50 cursor-pointer')}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm w-5 text-center leading-none">{n.icon}</span>
                    {n.label}
                  </div>
                  {locked && <span className="text-[9px] text-ink-300 bg-ink-100 px-1.5 py-0.5 rounded">Pro</span>}
                </div>
              )
            })}
          </nav>

          <div className="mt-auto px-4 pt-4 border-t border-ink-100 mx-3">
            {plan === 'FREE' ? (
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-violet-900 mb-1">Unlock everything</p>
                <p className="text-[10px] text-violet-600 mb-2">Graph, AI, digest, and more</p>
                <Link href="/pricing" className="block py-2 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700">
                  Upgrade — $12/mo
                </Link>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-[10px] text-ink-400 mb-1">Demo — {plan} plan features active</div>
                <Link href="/auth/sign-up" className="block py-2 bg-ink-900 text-ink-50 rounded-lg text-xs font-medium hover:bg-ink-800">
                  Sign up free →
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Items saved',    value: visibleItems.length },
                { label: 'AI connections', value: plan === 'FREE' ? '—' : 3 },
                { label: 'Topics',         value: plan === 'FREE' ? '—' : 8 },
              ].map(s => (
                <div key={s.label} className="bg-white border border-ink-100 rounded-2xl p-4">
                  <div className="text-[10px] text-ink-400 uppercase tracking-wide font-medium mb-1">{s.label}</div>
                  <div className="font-display text-3xl text-ink-900">{s.value}</div>
                </div>
              ))}
            </div>

            {/* AI connections */}
            {plan !== 'FREE' && (
              <div className="mb-4">
                <div className="text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-2">AI-found connections</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {DEMO_CONNECTIONS.map(c => (
                    <div key={c.title} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white border border-ink-100 rounded-full text-xs text-ink-600 hover:border-violet-200 hover:text-violet-700 transition-all cursor-pointer">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      {c.title.slice(0, 50)}…
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free plan gate message */}
            {plan === 'FREE' && (
              <div className="mb-4 p-4 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-900">Showing 3 of 6 items</p>
                  <p className="text-xs text-violet-600">Upgrade to Pro for unlimited items and AI connections</p>
                </div>
                <button onClick={() => setPlan('PRO')}
                  className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-medium hover:bg-violet-700 whitespace-nowrap">
                  See Pro demo
                </button>
              </div>
            )}

            {/* Items grid */}
            <div className="text-[10px] font-medium text-ink-500 uppercase tracking-wide mb-3">
              Recent ({visibleItems.length})
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map(item => (
                <div key={item.id} className="bg-white border border-ink-100 rounded-2xl p-4 hover:shadow-card transition-all cursor-default">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn('text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wide',
                      TYPE_COLORS[item.type] ?? 'bg-ink-100 text-ink-600')}>
                      {item.type}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-ink-900 leading-snug mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-2">{item.summary}</p>
                  <ul className="space-y-1 mb-3">
                    {item.keyInsights.slice(0, 2).map((ins, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-ink-500">
                        <span className="text-violet-400 shrink-0">›</span>
                        <span className="line-clamp-1">{ins}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: 'rgba(115,64,245,0.07)', color: '#534AB7' }}>{t}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-ink-300 mt-3 pt-3 border-t border-ink-50">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── AI Chat panel ───────────────────────────────────────── */}
          <aside className="w-80 xl:w-96 border-l border-ink-100 bg-white flex flex-col shrink-0">
            <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-ink-800">Ask your knowledge base</span>
              </div>
              <span className="text-[10px] text-ink-400 bg-ink-50 px-2 py-1 rounded-full">
                {plan === 'FREE' ? '3 indexed' : '6 indexed'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="chat-bubble-ai">{aiMsg}</div>

              {typing && (
                <div className="chat-bubble-ai">
                  <div className="flex gap-1 items-center h-5">
                    {[0,1,2].map(j => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce"
                        style={{ animationDelay: `${j * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {plan === 'FREE' && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-violet-900 mb-1">AI Q&A requires Pro</p>
                  <p className="text-[10px] text-violet-600 mb-2">Ask unlimited questions from your knowledge base</p>
                  <button onClick={() => setPlan('PRO')}
                    className="text-xs text-violet-600 underline hover:text-violet-700">See Pro demo</button>
                </div>
              )}

              {plan !== 'FREE' && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-ink-400">Try asking:</p>
                  {[
                    'What have I saved about learning and memory?',
                    'What patterns do you see across my saved items?',
                    'What should I read next based on my interests?',
                  ].map(s => (
                    <button key={s} onClick={() => { setInput(s); setTimeout(simulateAsk, 100) }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-100 transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-ink-100">
              <div className="flex gap-2 items-center">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') simulateAsk() }}
                  placeholder={plan === 'FREE' ? 'Upgrade to Pro to ask questions…' : 'Ask anything about your notes…'}
                  disabled={plan === 'FREE'}
                  className="flex-1 text-sm px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-xl outline-none text-ink-800 placeholder-ink-400 disabled:opacity-50" />
                <button onClick={simulateAsk} disabled={plan === 'FREE' || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center hover:bg-violet-600 disabled:opacity-40 transition-all shrink-0">
                  →
                </button>
              </div>
              <p className="text-[10px] text-ink-300 mt-2 text-center">
                Demo — <Link href="/auth/sign-up" className="text-violet-500 hover:underline">sign up free</Link> to use with real content
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
