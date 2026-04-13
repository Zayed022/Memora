'use client'
import { useState, useRef, useEffect } from 'react'
import { formatRelative, getItemTypeIcon, getItemTypeLabel, cn, truncate } from '@/lib/utils'
import type { Item, Connection, User } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Props {
  user: User
  initialItems: Item[]
  initialConnections: any[]
  stats: any[]
}

interface Message {
  role: 'user' | 'ai'
  content: string
  loading?: boolean
}

const SUGGESTIONS = [
  'What have I saved about productivity?',
  'Find connections between my recent notes',
  'What are my key insights this week?',
  'Summarise everything about AI',
]

export default function DashboardClient({ user, initialItems, initialConnections, stats }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [connections] = useState(initialConnections)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hi${user.name ? ` ${user.name.split(' ')[0]}` : ''}! I've indexed all ${initialItems.length} of your saved items. Ask me anything — I'll answer from your own knowledge base.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const totalItems = stats.reduce((s: number, g: any) => s + g._count, 0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredItems = items.filter(item => {
    if (activeTag && !item.tags.includes(activeTag)) return false
    if (!filter) return true
    const q = filter.toLowerCase()
    return item.title.toLowerCase().includes(q)
      || (item.summary ?? '').toLowerCase().includes(q)
      || item.tags.some(t => t.toLowerCase().includes(q))
  })

  const allTags = Array.from(new Set(items.flatMap(i => i.tags))).slice(0, 12)

  async function sendMessage(text?: string) {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    setMessages(m => [...m, { role: 'user', content: q }, { role: 'ai', content: '', loading: true }])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json()
      setMessages(m => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'ai', content: data.answer ?? 'No answer found.' }
        return copy
      })
    } catch {
      setMessages(m => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'ai', content: 'Sorry, something went wrong. Try again.' }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }

  async function deleteItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
    toast.success('Item deleted')
  }

  async function togglePublic(id: string, current: boolean) {
    const res = await fetch(`/api/items/${id}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !current }),
    })
    const data = await res.json()
    setItems(prev => prev.map(i => i.id === id ? { ...i, isPublic: !current, publicSlug: data.slug } : i))
    if (!current && data.slug) {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${data.slug}`)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="flex h-full">
      {/* Main panel */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 min-w-0">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Items saved', value: totalItems },
            { label: 'AI connections', value: connections.length },
            { label: 'Topics', value: allTags.length },
          ].map(s => (
            <div key={s.label} className="bg-white border border-ink-100 rounded-2xl p-4">
              <div className="text-xs text-ink-400 mb-1">{s.label}</div>
              <div className="font-display text-3xl text-ink-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick add */}
        <div className="bg-white border border-ink-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1 text-sm text-ink-400">What do you want to save?</div>
          <div className="flex items-center gap-2">
            {[
              { label: 'URL', href: '/dashboard/add?type=ARTICLE' },
              { label: 'Note', href: '/dashboard/add?type=NOTE' },
              { label: 'Voice', href: '/dashboard/add?type=VOICE' },
              { label: 'PDF', href: '/dashboard/add?type=PDF' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className="px-3 py-1.5 bg-ink-50 hover:bg-ink-100 border border-ink-100 rounded-lg text-xs font-medium text-ink-600 transition-colors">
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Connections */}
        {connections.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm text-ink-700">AI-found connections</h2>
              <Link href="/dashboard/connections" className="text-xs text-violet-600 hover:text-violet-700">View all →</Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {connections.slice(0, 6).map((c: any) => (
                <div key={c.id}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white border border-ink-100 hover:border-violet-200 rounded-full text-xs text-ink-600 hover:text-violet-700 cursor-pointer transition-all">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  {truncate(c.title, 40)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + search */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-medium text-sm text-ink-700 shrink-0">
              {filter || activeTag ? `Results (${filteredItems.length})` : `Recent (${items.length})`}
            </h2>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filter…"
              className="flex-1 px-3 py-1.5 bg-ink-50 border border-ink-100 rounded-lg text-sm text-ink-700 placeholder-ink-400 outline-none focus:border-ink-300 transition-colors"
            />
            <Link href="/dashboard/add"
              className="flex items-center gap-1 px-3 py-1.5 bg-ink-900 text-ink-50 rounded-lg text-xs font-medium hover:bg-ink-800 transition-colors shrink-0">
              + Add
            </Link>
          </div>

          {/* Tag filter pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                    activeTag === tag
                      ? 'bg-ink-900 text-ink-50'
                      : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                  )}>
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Items grid */}
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-ink-400 text-sm">
                {items.length === 0 ? 'Start by saving your first item.' : 'No items match your search.'}
              </p>
              {items.length === 0 && (
                <Link href="/dashboard/add" className="mt-4 inline-block px-4 py-2 bg-ink-900 text-ink-50 rounded-lg text-sm">
                  Add your first item →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map(item => (
                <ItemCard key={item.id} item={item} onDelete={deleteItem} onShare={togglePublic} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat panel */}
      <aside className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col border-l border-ink-100 bg-white">
        <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft" />
          <span className="text-sm font-medium text-ink-800">Ask your knowledge base</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              'rounded-xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-violet-50 text-violet-900 ml-6'
                : 'bg-ink-50 text-ink-700'
            )}>
              {msg.loading ? (
                <div className="flex gap-1 items-center h-5">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-ink-300 animate-bounce" style={{animationDelay:`${i*0.15}s`}} />
                  ))}
                </div>
              ) : msg.content}
            </div>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-ink-400 px-1">Try asking:</p>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-ink-600 bg-ink-50 hover:bg-ink-100 border border-ink-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-ink-100">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=e.target.scrollHeight+'px' }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Ask anything about your notes…"
              rows={1}
              className="flex-1 text-sm px-3 py-2.5 bg-ink-50 border border-ink-100 rounded-xl resize-none outline-none focus:border-ink-300 text-ink-800 placeholder-ink-400 transition-colors max-h-32 overflow-y-auto"
              style={{ minHeight: '40px' }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-ink-900 text-ink-50 flex items-center justify-center hover:bg-ink-800 disabled:opacity-40 transition-all shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 1L1 7.5l4 2M13 1L6.5 13l-1.5-3.5M13 1L5 9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function ItemCard({ item, onDelete, onShare }: { item: Item; onDelete: (id: string) => void; onShare: (id: string, current: boolean) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="group bg-white border border-ink-100 rounded-2xl p-4 card-hover relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{getItemTypeIcon(item.type)}</span>
          <span className="text-xs text-ink-400">{getItemTypeLabel(item.type)}</span>
          {item.status === 'PROCESSING' && (
            <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full">processing…</span>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-ink-100 flex items-center justify-center text-ink-400 transition-all">
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 bg-white border border-ink-100 rounded-xl shadow-lg z-10 py-1 min-w-[140px]" onMouseLeave={() => setMenuOpen(false)}>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-ink-600 hover:bg-ink-50">
                  Open source ↗
                </a>
              )}
              <button onClick={() => { onShare(item.id, item.isPublic); setMenuOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-ink-600 hover:bg-ink-50 w-full text-left">
                {item.isPublic ? 'Unshare' : 'Share card'}
              </button>
              <button onClick={() => { onDelete(item.id); setMenuOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-medium text-sm text-ink-900 leading-snug mb-2 line-clamp-2">
        {item.title}
      </h3>

      {item.summary && (
        <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-3">
          {item.summary}
        </p>
      )}

      {item.keyInsights.length > 0 && (
        <ul className="mb-3 space-y-1">
          {item.keyInsights.slice(0, 2).map((insight, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-ink-500">
              <span className="text-violet-400 mt-0.5 shrink-0">›</span>
              <span className="line-clamp-1">{insight}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {item.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-ink-50 text-ink-500 rounded-full text-[10px] font-medium border border-ink-100">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-50">
        <span className="text-[10px] text-ink-300">{formatRelative(item.createdAt)}</span>
        {item.isPublic && (
          <span className="text-[10px] text-sage-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400" /> Shared
          </span>
        )}
      </div>
    </div>
  )
}
