'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SettingsClient({ user, clerkUser }: { user: any; clerkUser: any }) {
  const [loading, setLoading]     = useState(false)
  const [exporting, setExporting] = useState(false)

  async function openBillingPortal() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } catch { toast.error('Could not open billing portal') }
    finally  { setLoading(false) }
  }

  async function upgradeToPro() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'PRO' }),
      })
      const { url } = await res.json()
      window.location.href = url
    } catch { toast.error('Could not start checkout') }
    finally  { setLoading(false) }
  }

  async function exportData(format: 'json' | 'markdown') {
    setExporting(true)
    try {
      const res  = await fetch(`/api/export?format=${format}`)
      const blob = await res.blob()
      const ext  = format === 'markdown' ? 'md' : 'json'
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(blob)
      a.download = `memora-export.${ext}`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success(`Exported as ${ext.toUpperCase()}`)
    } catch { toast.error('Export failed') }
    finally  { setExporting(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink-900 mb-1">Settings</h1>
        <p className="text-ink-400 text-sm">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <div className="bg-white border border-ink-100 rounded-2xl p-6">
        <h2 className="font-medium text-ink-900 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          {clerkUser.imageUrl ? (
            <Image src={clerkUser.imageUrl} alt="Avatar" width={48} height={48} className="rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-lg">
              {clerkUser.name?.[0] ?? clerkUser.email?.[0] ?? 'U'}
            </div>
          )}
          <div>
            <div className="font-medium text-ink-900">{clerkUser.name ?? 'No name set'}</div>
            <div className="text-sm text-ink-400">{clerkUser.email}</div>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="bg-white border border-ink-100 rounded-2xl p-6">
        <h2 className="font-medium text-ink-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between p-4 bg-ink-50 rounded-xl mb-4">
          <div>
            <div className="font-medium text-ink-900">{user.plan} plan</div>
            <div className="text-sm text-ink-400 mt-0.5">
              {user.plan === 'FREE' ? '50 items · 10 AI queries/month' : 'Unlimited items & AI queries · Weekly digest'}
            </div>
          </div>
          <div className={cn('px-3 py-1 rounded-full text-xs font-medium',
            user.plan === 'FREE' ? 'bg-ink-200 text-ink-600' : 'bg-violet-100 text-violet-700')}>
            {user.plan}
          </div>
        </div>
        {user.plan === 'FREE' ? (
          <div className="space-y-3">
            <button onClick={upgradeToPro} disabled={loading}
              className="w-full py-3 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-400 disabled:opacity-50 transition-colors">
              Upgrade to Pro — $12/month
            </button>
            <Link href="/pricing" className="block w-full py-3 border border-ink-200 text-ink-600 rounded-xl text-sm font-medium hover:bg-ink-50 transition-colors text-center">
              View all plans
            </Link>
          </div>
        ) : (
          <button onClick={openBillingPortal} disabled={loading}
            className="w-full py-3 border border-ink-200 text-ink-700 rounded-xl text-sm font-medium hover:bg-ink-50 disabled:opacity-50 transition-colors">
            Manage subscription & invoices →
          </button>
        )}
      </div>

      {/* Usage */}
      <div className="bg-white border border-ink-100 rounded-2xl p-6">
        <h2 className="font-medium text-ink-900 mb-4">Usage</h2>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-ink-600">Items saved</span>
          <span className="font-mono text-ink-800">{user.itemCount}{user.plan === 'FREE' ? ' / 50' : ' / ∞'}</span>
        </div>
        {user.plan === 'FREE' && (
          <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full', user.itemCount / 50 > 0.8 ? 'bg-amber-400' : 'bg-violet-400')}
              style={{ width: `${Math.min((user.itemCount / 50) * 100, 100)}%` }} />
          </div>
        )}
      </div>

      {/* Extension */}
      <div className="bg-white border border-ink-100 rounded-2xl p-6">
        <h2 className="font-medium text-ink-900 mb-1">Browser extension</h2>
        <p className="text-sm text-ink-400 mb-4">Save any webpage in one click. Chrome, Brave, Edge.</p>
        <a href="https://chrome.google.com/webstore/detail/memora" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-ink-50 rounded-xl text-sm font-medium hover:bg-ink-800 transition-colors">
          🔗 Install Chrome extension
        </a>
      </div>

      {/* Export */}
      <div className="bg-white border border-ink-100 rounded-2xl p-6">
        <h2 className="font-medium text-ink-900 mb-1">Export your data</h2>
        <p className="text-sm text-ink-400 mb-4">Your knowledge is always yours. Download everything anytime.</p>
        <div className="flex gap-3">
          <button onClick={() => exportData('json')} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-ink-200 text-ink-700 rounded-xl text-sm hover:bg-ink-50 disabled:opacity-50 transition-colors">
            ⬇ JSON
          </button>
          <button onClick={() => exportData('markdown')} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-ink-200 text-ink-700 rounded-xl text-sm hover:bg-ink-50 disabled:opacity-50 transition-colors">
            ⬇ Markdown
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <h2 className="font-medium text-red-600 mb-2">Danger zone</h2>
        <p className="text-sm text-ink-400 mb-4">Permanent — cannot be undone.</p>
        <button onClick={() => {
          if (confirm('Delete your account and ALL data forever?')) {
            fetch('/api/account', { method: 'DELETE' }).then(() => { window.location.href = '/' })
          }
        }} className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm hover:bg-red-50 transition-colors">
          Delete my account and all data
        </button>
      </div>
    </div>
  )
}
