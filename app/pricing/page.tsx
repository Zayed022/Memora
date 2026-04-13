'use client'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    desc: 'Perfect for getting started',
    features: [
      '50 items saved',
      'AI summaries on every item',
      'Basic keyword search',
      '10 AI questions per month',
      'Public card sharing',
    ],
    missing: ['Unlimited items', 'Semantic search', 'Browser extension', 'Voice memos', 'Weekly digest'],
    cta: 'Start free',
    href: '/auth/sign-up',
    highlight: false,
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthly: 12,
    yearly: 99,
    desc: 'For serious knowledge builders',
    features: [
      'Unlimited items',
      'Unlimited AI questions',
      'Semantic search',
      'AI connection discovery',
      'Browser extension',
      'Voice memos + transcription',
      'Weekly AI digest email',
      'Public card sharing',
      'Priority support',
    ],
    missing: [],
    cta: 'Start Pro',
    href: '/auth/sign-up?plan=pro',
    highlight: true,
  },
  {
    id: 'TEAM',
    name: 'Team',
    monthly: 29,
    yearly: 240,
    desc: 'For teams that learn together',
    features: [
      'Everything in Pro',
      'Shared knowledge bases',
      'Team connection graph',
      'Admin dashboard',
      'SSO / SAML',
      'Custom data retention',
      'Dedicated onboarding',
      'SLA support',
    ],
    missing: [],
    cta: 'Contact us',
    href: 'mailto:hello@memora.app',
    highlight: false,
  },
]

const FAQ = [
  {
    q: 'What counts as an "item"?',
    a: 'Any piece of content you save — an article URL, a written note, a voice memo, or a PDF. Each one counts as one item.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. You can export all your items as JSON or Markdown at any time from Settings. Your data is always yours.',
  },
  {
    q: 'What AI model does Memora use?',
    a: "Memora uses Claude (by Anthropic) for all AI features — summaries, tagging, question answering, connection discovery, and digests.",
  },
  {
    q: 'Is my knowledge base private?',
    a: 'Completely private by default. Only items you explicitly share (via a public card link) are visible to others.',
  },
  {
    q: 'Can I cancel anytime?',
    a: "Yes. Cancel from Settings at any time. You'll keep Pro access until the end of your billing period, then move to Free.",
  },
  {
    q: 'Do you offer a student discount?',
    a: 'Yes — 50% off Pro for students with a valid .edu email. Email us at hello@memora.app.',
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="glass border-b border-ink-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-ink-900">
          mem<span className="text-violet-500">ora</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/sign-in" className="text-sm text-ink-500 hover:text-ink-900 transition-colors">Sign in</Link>
          <Link href="/auth/sign-up" className="px-4 py-2 bg-ink-900 text-ink-50 rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 className="font-display text-6xl text-ink-900 mb-4">Simple pricing</h1>
          <p className="text-xl text-ink-500 mb-8">Start free. Upgrade when your brain needs more room.</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-white border border-ink-200 rounded-xl p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                billing === 'monthly' ? 'bg-ink-900 text-ink-50' : 'text-ink-500 hover:text-ink-800'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                billing === 'yearly' ? 'bg-ink-900 text-ink-50' : 'text-ink-500 hover:text-ink-800'
              )}
            >
              Yearly
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                billing === 'yearly' ? 'bg-sage-500 text-white' : 'bg-sage-100 text-sage-700'
              )}>
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-3xl p-8 flex flex-col',
                plan.highlight
                  ? 'bg-ink-900 text-ink-50'
                  : 'bg-white border border-ink-100 text-ink-900'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-violet-500 rounded-full text-white text-xs font-medium whitespace-nowrap">
                  Most popular
                </div>
              )}

              <div>
                <div className={cn('text-sm font-medium mb-1', plan.highlight ? 'text-ink-400' : 'text-ink-500')}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-display text-5xl">
                    ${billing === 'yearly' && plan.monthly > 0
                      ? Math.round(plan.yearly / 12)
                      : plan.monthly}
                  </span>
                  {plan.monthly > 0 && (
                    <span className={cn('text-sm', plan.highlight ? 'text-ink-500' : 'text-ink-400')}>
                      /mo{billing === 'yearly' ? ', billed yearly' : ''}
                    </span>
                  )}
                  {plan.monthly === 0 && (
                    <span className={cn('text-sm', plan.highlight ? 'text-ink-500' : 'text-ink-400')}>forever</span>
                  )}
                </div>
                {billing === 'yearly' && plan.monthly > 0 && (
                  <div className={cn('text-xs mb-4', plan.highlight ? 'text-ink-400' : 'text-ink-400')}>
                    ${plan.yearly}/year — saves ${plan.monthly * 12 - plan.yearly}
                  </div>
                )}
                <p className={cn('text-sm mb-6', plan.highlight ? 'text-ink-400' : 'text-ink-500')}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7l3.5 3.5L12 3" stroke={plan.highlight ? '#a98eff' : '#3d7e3d'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={plan.highlight ? 'text-ink-200' : 'text-ink-700'}>{f}</span>
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm opacity-35">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  'block w-full py-3 rounded-xl text-sm font-medium text-center transition-all',
                  plan.highlight
                    ? 'bg-violet-500 text-white hover:bg-violet-400'
                    : 'bg-ink-900 text-ink-50 hover:bg-ink-800'
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl text-ink-900 text-center mb-10">Questions</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-medium text-ink-900 text-sm">{item.q}</span>
                  <span className={cn(
                    'text-ink-400 transition-transform text-lg leading-none',
                    openFaq === i ? 'rotate-45' : ''
                  )}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-ink-500 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-ink-400 text-sm mb-4">Still have questions?</p>
          <a href="mailto:hello@memora.app" className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors">
            hello@memora.app →
          </a>
        </div>
      </main>
    </div>
  )
}
