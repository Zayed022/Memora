'use client'
export const dynamic = "force-dynamic"
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',             label: 'All items',    icon: '⊞' },
  { href: '/dashboard/articles',    label: 'Articles',     icon: '◈' },
  { href: '/dashboard/notes',       label: 'Notes',        icon: '≡' },
  { href: '/dashboard/voice',       label: 'Voice memos',  icon: '◎' },
  { href: '/dashboard/connections', label: 'Connections',  icon: '✦' },
  { href: '/dashboard/digest',      label: 'Digest',       icon: '◇' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-ink-50 overflow-hidden">
      {/* Top bar */}
      <header className="h-14 glass border-b border-ink-100 flex items-center px-4 gap-4 z-40 shrink-0">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round"/>
          </svg>
        </button>
        <Link href="/" className="font-display text-xl text-ink-900 shrink-0">
          mem<span className="text-violet-500">ora</span>
        </Link>
        {/* Search */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5"/>
            <path d="M10.5 10.5L14 14" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Search your knowledge base…"
            className="w-full pl-9 pr-4 py-2 bg-ink-100 rounded-xl text-sm text-ink-700 placeholder-ink-400 border border-transparent focus:border-ink-300 focus:bg-white outline-none transition-all"
            onFocus={(e) => {
              // In production, open a search modal here
              e.target.blur()
              window.location.href = '/dashboard/search'
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/dashboard/add"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-ink-900 text-ink-50 rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors"
          >
            <span className="text-base leading-none">+</span> Add
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          'w-56 shrink-0 bg-white border-r border-ink-100 flex flex-col py-4 overflow-y-auto',
          'absolute md:relative inset-y-0 left-0 z-30 transition-transform duration-200',
          'md:translate-x-0 top-14',
          sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        )}>
          <nav className="px-3 space-y-0.5">
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all',
                  pathname === item.href
                    ? 'bg-ink-900 text-ink-50 font-medium'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-ink-50'
                )}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 px-3">
            <div className="text-xs text-ink-400 px-3 mb-2 font-medium tracking-wide uppercase">Topics</div>
            {[
              { label: 'AI & ML',   color: '#7340f5' },
              { label: 'Product',   color: '#3d7e3d' },
              { label: 'Finance',   color: '#d97706' },
              { label: 'Health',    color: '#e85d24' },
              { label: 'Psychology',color: '#be185d' },
            ].map(t => (
              <button
                key={t.label}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink-500 hover:text-ink-900 hover:bg-ink-50 w-full text-left transition-all"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-auto px-3 pt-4 border-t border-ink-100 mx-3">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-ink-400 hover:text-ink-900 hover:bg-ink-50 transition-all"
            >
              <span>⚙</span> Settings
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-violet-600 hover:bg-violet-50 transition-all"
            >
              <span>✦</span> Upgrade to Pro
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-ink-900/20 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
