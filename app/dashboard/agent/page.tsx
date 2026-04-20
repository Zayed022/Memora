'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AgentStep {
  stepNumber: number; toolName: string; params: Record<string, any>
  result: { success: boolean; output: string; error?: string }; durationMs: number
}

interface AgentRun {
  id: string; status: string; steps: AgentStep[]
  finalAnswer: string; durationMs: number; goal: string
}

const EXAMPLE_WORKFLOWS = [
  {
    label:    'Research → LinkedIn post',
    icon:     '📝',
    goal:     'Summarize this article https://hbr.org/2023/01/how-to-build-a-second-brain then search my knowledge base for related ideas and create a LinkedIn post combining both',
    estimate: '~3 steps · 20-40s',
  },
  {
    label:    'Learn → Study notes',
    icon:     '📚',
    goal:     'Search my knowledge base for everything about productivity and spaced repetition, then create comprehensive study notes I can review later',
    estimate: '~2 steps · 15-30s',
  },
  {
    label:    'Insights → Twitter thread',
    icon:     '𝕏',
    goal:     'Ask my knowledge base what I know about AI and the future of work, then write an 8-tweet thread sharing my top insights',
    estimate: '~2 steps · 15-25s',
  },
  {
    label:    'Research → Email draft',
    icon:     '✉️',
    goal:     'Search my knowledge base for everything about SaaS pricing strategies and draft a professional email to our team summarising the key learnings',
    estimate: '~2 steps · 15-25s',
  },
]

const TOOL_ICONS: Record<string, string> = {
  summarise_url:          '🔗',
  save_to_knowledge_base: '💾',
  search_knowledge_base:  '🔍',
  ask_knowledge_base:     '🧠',
  generate_linkedin_post: '💼',
  generate_twitter_thread:'𝕏',
  draft_email:            '✉️',
  create_study_summary:   '📚',
}

export default function AgentPage() {
  const [goal, setGoal]     = useState('')
  const [run, setRun]       = useState<AgentRun | null>(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  async function execute() {
    if (!goal.trim()) return toast.error('Describe what you want the agent to do')
    setRunning(true); setRun(null)

    try {
      const res  = await fetch('/api/agent', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ goal: goal.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.upgrade) { toast.error('AI Agent requires Pro plan'); return }
        throw new Error(data.error ?? 'Agent run failed')
      }

      setRun(data)
      toast.success(`Completed in ${(data.durationMs / 1000).toFixed(1)}s · ${data.steps.length} steps`)
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
    } finally {
      setRunning(false)
    }
  }

  async function copyResult() {
    if (!run?.finalAnswer) return
    await navigator.clipboard.writeText(run.finalAnswer)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1 mt-12">
          <h1 className="font-display text-3xl text-ink-900">AI Agent</h1>
          <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">Pro</span>
        </div>
        <p className="text-ink-400 text-sm">
          Describe a multi-step task. The agent will break it into steps, use your knowledge base, and deliver a complete result.
        </p>
      </div>

      {/* Goal input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-ink-500 uppercase tracking-wide mb-2">Your goal</label>
        <textarea
          value={goal}
          onChange={e => setGoal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) execute() }}
          rows={4}
          placeholder="e.g. Summarise these 3 URLs, find related ideas from my knowledge base, then write a LinkedIn post combining the best insights…"
          className="w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm text-ink-800 outline-none focus:border-violet-400 transition-colors resize-none leading-relaxed"
        />
        <p className="text-xs text-ink-400 mt-1.5">⌘ + Enter to run · Max 1,000 characters</p>
      </div>

      <button
        onClick={execute}
        disabled={running || !goal.trim()}
        className="w-full py-3.5 bg-ink-900 text-ink-50 rounded-xl text-sm font-medium hover:bg-ink-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mb-8"
      >
        {running ? (
          <>
            <div className="w-4 h-4 border-2 border-ink-400 border-t-ink-50 rounded-full animate-spin" />
            Agent is working…
          </>
        ) : (
          <><span>⚡</span> Run agent</>
        )}
      </button>

      {/* Example workflows */}
      {!run && !running && (
        <div>
          <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">Example workflows</div>
          <div className="grid grid-cols-2 gap-3">
            {EXAMPLE_WORKFLOWS.map(w => (
              <button
                key={w.label}
                onClick={() => setGoal(w.goal)}
                className="text-left p-4 bg-white border border-ink-100 rounded-2xl hover:border-violet-200 hover:bg-violet-50/30 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{w.icon}</span>
                  <span className="text-xs font-medium text-ink-700 group-hover:text-violet-700">{w.label}</span>
                </div>
                <p className="text-xs text-ink-500 leading-relaxed line-clamp-2">{w.goal.slice(0, 100)}…</p>
                <div className="text-[10px] text-ink-300 mt-2">{w.estimate}</div>
              </button>
            ))}
          </div>

          {/* Tools available */}
          <div className="mt-6 bg-white border border-ink-100 rounded-2xl p-5">
            <div className="text-xs font-medium text-ink-500 uppercase tracking-wide mb-3">Available tools</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TOOL_ICONS).map(([name, icon]) => (
                <div key={name} className="flex items-center gap-2 text-xs text-ink-600">
                  <span>{icon}</span>
                  <span>{name.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Running state */}
      {running && (
        <div className="bg-white border border-ink-100 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            </div>
            <div>
              <div className="text-sm font-medium text-ink-900">Agent is executing your workflow…</div>
              <div className="text-xs text-ink-400">Breaking into steps, calling tools, building your result</div>
            </div>
          </div>
          <div className="space-y-2">
            {['Analysing your goal', 'Selecting tools', 'Executing steps', 'Building final answer'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-xs text-ink-500">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {run && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2.5 h-2.5 rounded-full', run.status === 'completed' ? 'bg-sage-400' : 'bg-red-400')} />
              <span className="text-sm font-medium text-ink-700">
                {run.status === 'completed' ? `Completed` : 'Failed'} · {run.steps.length} step{run.steps.length !== 1 ? 's' : ''} · {(run.durationMs / 1000).toFixed(1)}s
              </span>
            </div>
            <button
              onClick={() => setRun(null)}
              className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Steps */}
          {run.steps.length > 0 && (
            <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-50 text-xs font-medium text-ink-500 uppercase tracking-wide">
                Execution trace
              </div>
              <div className="divide-y divide-ink-50">
                {run.steps.map((step) => (
                  <div key={step.stepNumber} className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-medium flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <span className="text-sm">
                        {TOOL_ICONS[step.toolName] ?? '🔧'}
                      </span>
                      <span className="text-xs font-medium text-ink-700">{step.toolName.replace(/_/g, ' ')}</span>
                      <span className={cn('ml-auto text-[10px] font-medium', step.result.success ? 'text-sage-600' : 'text-red-500')}>
                        {step.result.success ? '✓' : '✗'} {step.durationMs}ms
                      </span>
                    </div>
                    {Object.keys(step.params).length > 0 && (
                      <div className="ml-8 text-[10px] text-ink-400 font-mono bg-ink-50 rounded px-2 py-1 mt-1 truncate">
                        {JSON.stringify(step.params).slice(0, 120)}
                      </div>
                    )}
                    {step.result.success && step.result.output && (
                      <div className="ml-8 text-xs text-ink-500 mt-1.5 leading-relaxed line-clamp-2">
                        {step.result.output}
                      </div>
                    )}
                    {!step.result.success && step.result.error && (
                      <div className="ml-8 text-xs text-red-500 mt-1">{step.result.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final answer */}
          {run.finalAnswer && (
            <div className="bg-white border border-ink-100 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-ink-50 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-500 uppercase tracking-wide">Final answer</span>
                <button
                  onClick={copyResult}
                  className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    copied ? 'bg-sage-500 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="px-4 py-4">
                <pre className="text-sm text-ink-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {run.finalAnswer}
                </pre>
              </div>
            </div>
          )}

          {/* Run again */}
          <button
            onClick={execute}
            className="w-full py-3 border border-ink-200 text-ink-600 rounded-xl text-sm hover:bg-ink-50 transition-colors"
          >
            Run again
          </button>
        </div>
      )}

      {/* Pro upsell */}
      <div className="mt-8 bg-violet-50 border border-violet-100 rounded-2xl p-5">
        <div className="text-sm font-medium text-violet-900 mb-1">⚡ Pro feature — AI Agent</div>
        <p className="text-sm text-violet-700 mb-3 leading-relaxed">
          The Agent can chain up to 10 steps: summarise URLs, search your knowledge base, generate posts, draft emails — all in one command. Available on Pro and above.
        </p>
        <Link href="/pricing" className="inline-block px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  )
}
