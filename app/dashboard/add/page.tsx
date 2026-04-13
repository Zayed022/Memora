'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type ItemType = 'ARTICLE' | 'NOTE' | 'VOICE' | 'PDF'

const TYPES: { type: ItemType; label: string; icon: string; desc: string }[] = [
  { type: 'ARTICLE', label: 'URL / Article', icon: '🔗', desc: 'Paste any link' },
  { type: 'NOTE',    label: 'Note',          icon: '📝', desc: 'Write freeform' },
  { type: 'VOICE',   label: 'Voice memo',    icon: '🎙️', desc: 'Record audio' },
  { type: 'PDF',     label: 'PDF',           icon: '📄', desc: 'Upload a file' },
]

export default function AddItemPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = (searchParams.get('type') as ItemType) ?? 'ARTICLE'

  const [type, setType] = useState<ItemType>(initialType)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [saving, setSaving] = useState(false)

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    const chunks: Blob[] = []
    mr.ondataavailable = e => chunks.push(e.data)
    mr.onstop = () => {
      setAudioBlob(new Blob(chunks, { type: 'audio/webm' }))
      stream.getTracks().forEach(t => t.stop())
    }
    mr.start()
    setRecorder(mr)
    setRecording(true)
  }

  function stopRecording() {
    recorder?.stop()
    setRecording(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (type === 'ARTICLE' && !url) return toast.error('Enter a URL')
    if (type === 'NOTE' && !content) return toast.error('Write something')
    if (type === 'PDF' && !file) return toast.error('Select a PDF')
    if (type === 'VOICE' && !audioBlob) return toast.error('Record something first')
    setSaving(true)

    try {
      const form = new FormData()
      form.append('type', type)
      if (url) form.append('url', url)
      if (title) form.append('title', title)
      if (content) form.append('content', content)
      if (file) form.append('file', file)
      if (audioBlob) form.append('audio', audioBlob, 'memo.webm')

      const res = await fetch('/api/items', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Failed')
      toast.success('Saved! AI is processing it now…')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink-900 mb-1">Add to your knowledge base</h1>
        <p className="text-ink-400 text-sm">Memora will summarise, tag, and connect it automatically.</p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {TYPES.map(t => (
          <button
            key={t.type}
            type="button"
            onClick={() => setType(t.type)}
            className={cn(
              'flex flex-col items-center gap-1.5 p-4 rounded-2xl border text-center transition-all',
              type === t.type
                ? 'bg-ink-900 border-ink-900 text-ink-50'
                : 'bg-white border-ink-100 text-ink-500 hover:border-ink-200 hover:text-ink-800'
            )}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-xs font-medium">{t.label}</span>
            <span className={cn('text-[10px]', type === t.type ? 'text-ink-400' : 'text-ink-300')}>{t.desc}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'ARTICLE' && (
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">URL</label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm text-ink-800 outline-none focus:border-violet-400 transition-colors"
              required
            />
            <p className="mt-1.5 text-xs text-ink-400">We'll read the full article and summarise it.</p>
          </div>
        )}

        {type === 'NOTE' && (
          <>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Title (optional)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Quick thought on…"
                className="w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm text-ink-800 outline-none focus:border-violet-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your note, idea, or thought here…"
                rows={8}
                className="w-full px-4 py-3 bg-white border border-ink-200 rounded-xl text-sm text-ink-800 outline-none focus:border-violet-400 transition-colors resize-none leading-relaxed"
                required
              />
            </div>
          </>
        )}

        {type === 'VOICE' && (
          <div className="text-center py-8">
            {audioBlob ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-3xl mx-auto">🎙️</div>
                <p className="text-sm text-ink-600">Recording ready!</p>
                <audio controls src={URL.createObjectURL(audioBlob)} className="mx-auto" />
                <button type="button" onClick={() => setAudioBlob(null)}
                  className="text-xs text-ink-400 hover:text-ink-600 underline">
                  Record again
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto transition-all',
                    recording ? 'bg-red-100 animate-pulse-soft' : 'bg-ink-100 hover:bg-ink-200'
                  )}
                >
                  {recording ? '⏹' : '🎙️'}
                </button>
                <p className="text-sm text-ink-500">
                  {recording ? 'Recording… tap to stop' : 'Tap to start recording'}
                </p>
              </div>
            )}
          </div>
        )}

        {type === 'PDF' && (
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">PDF file</label>
            <div
              className={cn(
                'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors',
                file ? 'border-sage-300 bg-sage-50' : 'border-ink-200 hover:border-ink-300'
              )}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="space-y-1">
                  <div className="text-3xl">📄</div>
                  <div className="font-medium text-sm text-ink-800">{file.name}</div>
                  <div className="text-xs text-ink-400">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-3xl text-ink-300">📁</div>
                  <div className="text-sm text-ink-500">Drop a PDF or click to select</div>
                  <div className="text-xs text-ink-400">Max 10 MB</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-ink-200 rounded-xl text-sm text-ink-600 hover:bg-ink-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-ink-900 text-ink-50 rounded-xl text-sm font-medium hover:bg-ink-800 disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving…' : 'Save to Memora ✦'}
          </button>
        </div>
      </form>
    </div>
  )
}
