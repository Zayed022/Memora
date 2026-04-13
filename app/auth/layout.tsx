export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-3xl text-ink-900">
            mem<span className="text-violet-500">ora</span>
          </a>
          <p className="mt-2 text-sm text-ink-400">Your AI second brain</p>
        </div>
        {children}
      </div>
    </div>
  )
}
