import { useState, useEffect } from 'react'
import { useConfig } from '../../hooks/useConfig'
import type { Seo } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export default function SeoEditor() {
  const { config, saveSection } = useConfig()
  const [seo, setSeo] = useState<Seo>({ title: '', description: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (config?.seo) setSeo(config.seo)
    else if (config?.bio?.name) setSeo((prev) => ({ ...prev, title: prev.title || config.bio.name }))
  }, [config])

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('seo', seo)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-1 text-gray-800">SEO &amp; Meta</h2>
      <p className="text-sm text-gray-500 mb-4">Controls the browser tab title, search snippet, and social sharing preview.</p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Page title</label>
          <input
            type="text"
            value={seo.title ?? ''}
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            placeholder={config?.bio?.name ?? 'Portfolio'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">Shown in the browser tab and search results. Falls back to your name if blank.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
          <textarea
            rows={3}
            value={seo.description ?? ''}
            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            placeholder="A short description for search engines and social cards."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <p className="mt-1 text-xs text-gray-400">Recommended 120–160 characters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={status === 'saving'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Save'}
          </button>
          {status === 'success' && <span className="text-sm text-green-600">Saved!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Save failed</span>}
        </div>
      </div>
    </section>
  )
}
