export const dynamic = "force-dynamic"
import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink-50 overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-display text-2xl text-ink-900">
            mem<span className="text-violet-500">ora</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-ink-500">
            <a href="#features" className="hover:text-ink-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-ink-900 transition-colors">Pricing</a>
            <a href="#how-it-works" className="hover:text-ink-900 transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <SignedIn>
              <Link href="/dashboard"
                className="px-4 py-2 bg-ink-900 text-ink-50 rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
                Open app →
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm text-ink-500 hover:text-ink-900 transition-colors px-3 py-2">
                  Sign in
                </button>
              </SignInButton>
              <Link href="/auth/sign-up"
                className="px-4 py-2 bg-ink-900 text-ink-50 rounded-lg text-sm font-medium hover:bg-ink-800 transition-colors">
                Start free →
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative">
        {/* BG orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-sage-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 border border-violet-200 rounded-full text-violet-700 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse-soft" />
            AI-powered · Save anything · Find everything
          </div>

          <h1 className="font-display text-6xl md:text-8xl text-ink-900 leading-[0.95] mb-8 animate-fade-up">
            Your knowledge,<br />
            <em className="gradient-text">finally organised.</em>
          </h1>

          <p className="text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-up" style={{animationDelay:'0.1s'}}>
            Save articles, notes, voice memos and PDFs. Memora's AI summarises everything, finds hidden connections, and answers your questions — from your own knowledge base.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{animationDelay:'0.2s'}}>
            <Link href="/auth/sign-up"
              className="w-full sm:w-auto px-8 py-4 bg-ink-900 text-ink-50 rounded-xl text-base font-medium hover:bg-ink-800 active:scale-[0.98] transition-all">
              Start for free — no credit card
            </Link>
            <a href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 bg-white border border-ink-200 text-ink-700 rounded-xl text-base font-medium hover:border-ink-300 transition-all text-center">
              See how it works
            </a>
          </div>

          <p className="mt-6 text-sm text-ink-400 animate-fade-up" style={{animationDelay:'0.3s'}}>
            50 items free forever · Pro from $12/month · Cancel anytime
          </p>
        </div>

        {/* Hero image mock */}
        <div className="max-w-5xl mx-auto mt-20 animate-fade-up" style={{animationDelay:'0.4s'}}>
          <div className="relative bg-white border border-ink-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-ink-900 px-6 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 bg-ink-800 rounded-md px-3 py-1 text-xs text-ink-400 font-mono max-w-xs">
                memora.app/dashboard
              </div>
            </div>
            <div className="grid grid-cols-[220px_1fr_280px] h-[420px]">
              {/* Sidebar */}
              <div className="border-r border-ink-100 p-4 bg-ink-50/50">
                {['All items','Articles','Notes','Voice memos','Connections'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 ${i === 0 ? 'bg-ink-900 text-ink-50' : 'text-ink-500'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {item}
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-ink-100">
                  <div className="text-xs text-ink-400 px-3 mb-2">Topics</div>
                  {['AI & ML','Product','Finance','Health'].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-500">
                      <div className="w-2 h-2 rounded-full" style={{background: ['#7340f5','#3d7e3d','#d97706','#e85d24'][i]}} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              {/* Main */}
              <div className="p-6 overflow-hidden">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[['247','Items saved'],['84','Connections'],['12','Topics']].map(([n,l]) => (
                    <div key={l} className="bg-ink-50 rounded-xl p-4">
                      <div className="text-2xl font-display font-bold text-ink-900">{n}</div>
                      <div className="text-xs text-ink-400">{l}</div>
                    </div>
                  ))}
                </div>
                {[
                  { t: 'Why your brain hates making decisions', s: 'Decision fatigue depletes cognitive reserves. Batch decisions to mornings.', tags: ['psychology','productivity'] },
                  { t: 'Key ideas from Thinking Fast & Slow', s: 'System 1 vs System 2. Loss aversion is 2× more powerful than equivalent gain.', tags: ['books','psychology'] },
                  { t: 'How Sequoia evaluates founders', s: 'Clarity of thought under pressure, evidence of rapid learning, genuine insight.', tags: ['startups','vc'] },
                ].map(card => (
                  <div key={card.t} className="bg-white border border-ink-100 rounded-xl p-4 mb-3">
                    <div className="text-sm font-medium text-ink-800 mb-1">{card.t}</div>
                    <div className="text-xs text-ink-400 line-clamp-1">{card.s}</div>
                    <div className="flex gap-1.5 mt-2">
                      {card.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* AI panel */}
              <div className="border-l border-ink-100 p-4 flex flex-col bg-white">
                <div className="text-xs font-medium text-ink-700 mb-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-400" />
                  Ask your knowledge base
                </div>
                <div className="flex-1 space-y-3">
                  <div className="bg-ink-50 rounded-xl p-3 text-xs text-ink-600 leading-relaxed">
                    I've indexed all 247 of your saved items. Ask me anything.
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-xs text-violet-800 ml-6 leading-relaxed">
                    What do I know about sleep?
                  </div>
                  <div className="bg-ink-50 rounded-xl p-3 text-xs text-ink-600 leading-relaxed">
                    You have 6 items about sleep. Key findings: sleep debt compounds, consistent wake time matters more than bedtime, caffeine has a 6-hr half-life.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl text-ink-900 mb-4">How Memora works</h2>
            <p className="text-lg text-ink-500">Three steps. Zero organisation effort.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: '01', t: 'Save anything', d: 'Paste a URL, write a note, record a voice memo, or upload a PDF. The browser extension saves pages in one click.', icon: '⬇️' },
              { n: '02', t: 'AI processes it', d: 'Claude reads every item, writes a crisp summary, extracts key insights, tags it, and finds connections to everything else you\'ve saved.', icon: '✨' },
              { n: '03', t: 'Ask and discover', d: 'Ask questions about your own knowledge. Get weekly digests. Share beautiful cards. Your knowledge compounds automatically.', icon: '💡' },
            ].map(step => (
              <div key={step.n} className="relative">
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="font-mono text-xs text-ink-300 mb-2">{step.n}</div>
                <h3 className="font-display text-2xl text-ink-900 mb-3">{step.t}</h3>
                <p className="text-ink-500 leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-ink-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl text-ink-900 mb-4">Everything your notes app isn't</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { t: 'AI summaries', d: 'Every item gets a crisp 2-3 sentence summary and key insights — extracted automatically by Claude.' },
              { t: 'Semantic search', d: 'Find items by meaning, not just keywords. Ask "what did I save about decision making?" and get the right answers.' },
              { t: 'Connection graph', d: 'Memora finds non-obvious links between your saved items — surfaces insights you didn\'t know you had.' },
              { t: 'Weekly digest', d: 'Every week, a personalised email digest of themes, patterns, and connections from your knowledge base.' },
              { t: 'Voice memos', d: 'Record a thought anywhere. Memora transcribes, summarises, and files it automatically.' },
              { t: 'Shareable cards', d: 'Turn any item into a beautiful public card. Share on Twitter. Every share brings new users in.' },
              { t: 'Browser extension', d: 'Save any webpage in one click. Memora reads the full article, not just the title.' },
              { t: 'Ask your brain', d: 'Chat with your own knowledge base. Get answers grounded in what you\'ve actually saved — not hallucinations.' },
              { t: 'Private by default', d: 'Your knowledge base is completely private. Share only what you choose, when you choose it.' },
            ].map(f => (
              <div key={f.t} className="bg-white border border-ink-100 rounded-2xl p-6 card-hover">
                <h3 className="font-medium text-ink-900 mb-2">{f.t}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-5xl text-ink-900 mb-4">Simple, honest pricing</h2>
            <p className="text-lg text-ink-500">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['50 items', 'AI summaries', 'Basic search', '10 AI queries/month'], cta: 'Start free', href: '/auth/sign-up', highlight: false },
              { name: 'Pro', price: '$12', period: '/month', features: ['Unlimited items', 'Unlimited AI queries', 'Browser extension', 'Voice memos', 'Weekly digest', 'Shareable cards'], cta: 'Start Pro', href: '/auth/sign-up?plan=pro', highlight: true },
              { name: 'Team', price: '$29', period: '/user/mo', features: ['Everything in Pro', 'Shared knowledge bases', 'Team connections', 'Admin dashboard', 'Priority support'], cta: 'Contact us', href: 'mailto:hello@memora.app', highlight: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? 'bg-ink-900 border-ink-800 text-ink-50' : 'bg-ink-50 border-ink-100 text-ink-900'} relative`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500 rounded-full text-white text-xs font-medium">
                    Most popular
                  </div>
                )}
                <div className={`text-sm font-medium mb-2 ${plan.highlight ? 'text-ink-300' : 'text-ink-500'}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-display text-4xl">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-ink-400' : 'text-ink-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-ink-200' : 'text-ink-600'}`}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7l3.5 3.5L12 3" stroke={plan.highlight ? '#a98eff' : '#3d7e3d'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}
                  className={`block w-full py-3 rounded-xl text-sm font-medium text-center transition-all ${plan.highlight ? 'bg-violet-500 text-white hover:bg-violet-400' : 'bg-ink-900 text-ink-50 hover:bg-ink-800'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_,i) => (
            <div key={i} className="absolute w-px bg-ink-50" style={{left:`${i*5.26}%`,top:0,bottom:0}} />
          ))}
        </div>
        <div className="max-w-2xl mx-auto text-center relative">
          <h2 className="font-display text-5xl text-ink-50 mb-6">
            Your knowledge is compounding.<br />
            <em className="text-violet-400">Are you?</em>
          </h2>
          <p className="text-ink-400 text-lg mb-10 leading-relaxed">
            Join thousands of people who never lose a good idea again.
          </p>
          <Link href="/auth/sign-up"
            className="inline-block px-10 py-4 bg-violet-500 text-white rounded-xl text-base font-medium hover:bg-violet-400 active:scale-[0.98] transition-all">
            Start for free — takes 30 seconds
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-ink-950 text-ink-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-display text-xl text-ink-300">
            mem<span className="text-violet-500">ora</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-ink-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-ink-300 transition-colors">Terms</Link>
            <a href="mailto:hello@memora.app" className="hover:text-ink-300 transition-colors">Contact</a>
          </div>
          <div className="text-xs text-ink-600">© 2025 Memora. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
