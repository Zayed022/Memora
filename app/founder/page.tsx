'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

const DEMO: any = {
  users: { total: 2847, newToday: 23, newWeek: 184, newMonth: 612, free: 2531, pro: 287, team: 29, paid: 316, activeToday: 412, activeWeek: 891, activeMonth: 1654 },
  revenue: { mrr: 4875, arr: 58500, ltv: 288, paidUsers: 316 },
  content: { totalItems: 34891, itemsWeek: 2341 },
  funnel: { signups: 2847, activated: 2109, engaged: 891, paid: 316, activationRate: 74, conversionRate: 11, retentionRate: 68 },
  valuation: { conservative: 175500, optimistic: 468000, assetBased: 94200, recommended: 175500 },
  weeklySignups: [41, 58, 72, 89, 103, 128, 156, 184].map((count, i) => ({ week: `W${i + 1}`, count })),
}

function fmt(n: number) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}` }
function fmtN(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n) }

export default function FounderPage() {
  const [data, setData]       = useState<any>(DEMO)
  const [isDemo, setIsDemo]   = useState(true)
  const [secret, setSecret]   = useState('')
  const [loading, setLoading] = useState(false)
  const chartsDrawn           = useRef(false)

  async function loadReal() {
    if (!secret) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin', { headers: { 'x-admin-secret': secret } })
      if (res.ok) { setData(await res.json()); setIsDemo(false); chartsDrawn.current = false }
      else alert('Invalid admin secret')
    } catch { alert('Could not connect') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (chartsDrawn.current) return
    chartsDrawn.current = true
    if (!(window as any).Chart) {
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
      s.onload = () => drawCharts(data)
      document.head.appendChild(s)
    } else {
      drawCharts(data)
    }
  }, [data])

  return (
    <div className="min-h-screen bg-[#0a0908] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display text-xl">mem<span className="text-violet-400">ora</span></Link>
          <span className="text-white/20">·</span>
          <span className="text-sm text-white/50">Founder dashboard</span>
          {isDemo && <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">Demo data</span>}
        </div>
        <div className="flex items-center gap-2">
          <input value={secret} onChange={e => setSecret(e.target.value)} type="password"
            placeholder="Admin secret" onKeyDown={e => { if (e.key === 'Enter') loadReal() }}
            className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 w-40" />
          <button onClick={loadReal} disabled={loading}
            className="px-3 py-1.5 bg-violet-600 rounded-lg text-sm hover:bg-violet-500 disabled:opacity-50 transition-colors">
            {loading ? '…' : 'Load real'}
          </button>
          <Link href="/demo" className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/60 hover:bg-white/20 transition-colors">
            Demo →
          </Link>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto space-y-6">

        {/* Valuation banner */}
        <div className="bg-violet-900/30 border border-violet-500/25 rounded-2xl p-6">
          <div className="text-xs text-violet-400 uppercase tracking-widest font-medium mb-4">Estimated acquisition value</div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-display">{fmt(data.valuation.conservative)}</div>
              <div className="text-sm text-white/40 mt-1">Conservative · 3× ARR</div>
            </div>
            <div>
              <div className="text-3xl font-display text-violet-300">{fmt(data.valuation.recommended)}</div>
              <div className="text-sm text-white/40 mt-1">Recommended ask price</div>
            </div>
            <div>
              <div className="text-3xl font-display">{fmt(data.valuation.optimistic)}</div>
              <div className="text-sm text-white/40 mt-1">Optimistic · 8× ARR</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-white/25">
            Based on {fmt(data.revenue.arr)} ARR · {fmtN(data.users.paid)} paid users · {data.funnel.activationRate}% activation · {fmt(data.valuation.assetBased)} asset floor
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total users',   value: fmtN(data.users.total),        sub: `+${data.users.newWeek} this week`, accent: '#7340f5' },
            { label: 'MRR',           value: fmt(data.revenue.mrr),          sub: `${fmt(data.revenue.arr)} ARR`,     accent: '#1D9E75' },
            { label: 'Paid users',    value: fmtN(data.users.paid),          sub: `${data.funnel.conversionRate}% conversion`, accent: '#3b82f6' },
            { label: 'DAU (30d)',     value: fmtN(data.users.activeMonth),   sub: `${data.funnel.retentionRate}% retention`,   accent: '#f59e0b' },
          ].map(m => (
            <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wide font-medium mb-2">{m.label}</div>
              <div className="text-2xl font-display" style={{ color: m.accent }}>{m.value}</div>
              <div className="text-xs text-white/30 mt-1">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-sm font-medium text-white/70 mb-4">Weekly user growth</div>
            <div style={{ position: 'relative', height: '200px' }}>
              <canvas id="chart-signups" role="img" aria-label="Weekly user signups">Weekly signups trend</canvas>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-sm font-medium text-white/70 mb-4">Conversion funnel</div>
            <div className="space-y-3 mt-2">
              {[
                { label: 'Signups',    val: data.funnel.signups,    pct: 100 },
                { label: 'Activated',  val: data.funnel.activated,  pct: data.funnel.activationRate },
                { label: 'Engaged',    val: data.funnel.engaged,    pct: Math.round((data.funnel.engaged / data.funnel.signups) * 100) },
                { label: 'Paid',       val: data.funnel.paid,       pct: data.funnel.conversionRate },
              ].map(f => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs text-white/50 mb-1.5">
                    <span>{f.label}</span>
                    <span>{fmtN(f.val)} ({f.pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 12-month MRR projection */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="text-sm font-medium text-white/70 mb-1">12-month MRR projection</div>
          <div className="text-xs text-white/30 mb-4">Assuming 10% monthly growth from current baseline</div>
          <div style={{ position: 'relative', height: '180px' }}>
            <canvas id="chart-mrr" role="img" aria-label="12-month MRR projection">Revenue projection</canvas>
          </div>
        </div>

        {/* Plan breakdown */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Free users',    value: fmtN(data.users.free),  pct: Math.round((data.users.free / data.users.total) * 100),  color: '#928c82' },
            { label: 'Pro users',     value: fmtN(data.users.pro),   pct: Math.round((data.users.pro  / data.users.total) * 100),  color: '#7340f5' },
            { label: 'Team users',    value: fmtN(data.users.team),  pct: Math.round((data.users.team / data.users.total) * 100),  color: '#1D9E75' },
          ].map(p => (
            <div key={p.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-xs text-white/40 uppercase tracking-wide font-medium mb-2">{p.label}</div>
              <div className="text-2xl font-display text-white">{p.value}</div>
              <div className="text-xs text-white/30 mt-1">{p.pct}% of total</div>
              <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Why buy Memora */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="text-sm font-medium text-white/70 mb-4">Why acquirers buy Memora</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🔒', title: 'Deep switching moat',   desc: 'Users build years of knowledge. After 3 months, switching cost approaches infinity.' },
              { icon: '💚', title: '$0 infrastructure',     desc: 'Gemini free tier, Supabase free, Vercel free. 95%+ gross margin from day one.' },
              { icon: '📈', title: 'Built-in viral loop',   desc: 'Share cards, referral programme, digest email. $0 CAC through virality.' },
              { icon: '🏢', title: 'B2B upside untapped',   desc: '$49/user/month Team plan. One 10-person company = $490/month MRR.' },
              { icon: '🧠', title: 'Agentic AI pipeline',   desc: 'Gemini function calling, 8 tools, full execution trace. Hard to replicate.' },
              { icon: '✅', title: 'GDPR compliance built', desc: 'PII detection, consent logging, Art 17 erasure. EU enterprise-ready.' },
            ].map(r => (
              <div key={r.title} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-xl">{r.icon}</span>
                <div>
                  <div className="text-sm font-medium text-white/80">{r.title}</div>
                  <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA links */}
        <div className="flex gap-3 justify-center pb-4">
          <Link href="/demo" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors">
            View live demo →
          </Link>
          <Link href="/vs" className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/15 transition-colors">
            Competitive analysis →
          </Link>
          <Link href="/pricing" className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/15 transition-colors">
            Pricing →
          </Link>
        </div>
      </div>
    </div>
  )
}

function drawCharts(data: any) {
  const C = (window as any).Chart
  if (!C) return
  ;['chart-signups', 'chart-mrr'].forEach(id => {
    const el = document.getElementById(id) as HTMLCanvasElement
    if (el) { const ex = C.getChart(el); if (ex) ex.destroy() }
  })

  const s = document.getElementById('chart-signups') as HTMLCanvasElement
  if (s) {
    new C(s, {
      type: 'line',
      data: {
        labels:   data.weeklySignups.map((w: any) => w.week),
        datasets: [{
          label: 'Signups', data: data.weeklySignups.map((w: any) => w.count),
          borderColor: '#7340f5', backgroundColor: '#7340f510', borderWidth: 2,
          fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#7340f5',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#ffffff10' }, ticks: { color: '#ffffff40', font: { size: 10 } } },
          y: { grid: { color: '#ffffff10' }, ticks: { color: '#ffffff40', font: { size: 10 } }, beginAtZero: true },
        },
      },
    })
  }

  const r = document.getElementById('chart-mrr') as HTMLCanvasElement
  if (r && data.revenue?.mrr) {
    const base = data.revenue.mrr
    const proj = Array.from({ length: 12 }, (_, i) => Math.round(base * Math.pow(1.10, i)))
    new C(r, {
      type: 'bar',
      data: {
        labels:   ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12'],
        datasets: [{
          label: 'MRR', data: proj,
          backgroundColor: proj.map((_, i) => i < 2 ? '#7340f530' : '#7340f560'),
          borderColor: '#7340f5', borderWidth: 1, borderRadius: 3,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#ffffff10' }, ticks: { color: '#ffffff40', font: { size: 10 } } },
          y: {
            grid: { color: '#ffffff10' },
            ticks: { color: '#ffffff40', font: { size: 10 }, callback: (v: number) => `$${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}` },
            beginAtZero: true,
          },
        },
      },
    })
  }
}
