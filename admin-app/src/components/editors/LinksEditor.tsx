import { useState, useEffect } from 'react'
import { Trash2, Plus } from 'lucide-react'
import { useConfig } from '../../hooks/useConfig'
import type { SiteLink } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export default function LinksEditor() {
  const { config, saveSection } = useConfig()
  const [links, setLinks] = useState<SiteLink[]>([])
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (config?.links) setLinks(config.links)
  }, [config])

  function addLink() {
    const defaultColor = config?.theme?.primaryColor ?? '#3b82f6'
    setLinks([
      ...links,
      { id: crypto.randomUUID(), label: '', url: '', icon: 'Link', color: defaultColor, visible: true },
    ])
  }

  function removeLink(id: string) {
    setLinks(links.filter((l) => l.id !== id))
  }

  function updateLink(id: string, patch: Partial<SiteLink>) {
    setLinks(links.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('links', links)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Links</h2>
      <div className="flex flex-col gap-3 mb-4">
        {links.map((link) => (
          <div key={link.id} className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 sm:flex-row sm:items-center sm:border-0 sm:p-0 sm:gap-2">
            <input
              type="text"
              placeholder="Label"
              value={link.label}
              onChange={(e) => updateLink(link.id, { label: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="https://…"
              value={link.url}
              onChange={(e) => updateLink(link.id, { url: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Icon (e.g. Github)"
              value={link.icon}
              onChange={(e) => updateLink(link.id, { icon: e.target.value })}
              className="sm:w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={link.visible}
                  onChange={(e) => updateLink(link.id, { visible: e.target.checked })}
                  className="rounded"
                />
                Visible
              </label>
              <input
                type="color"
                value={link.color ?? config?.theme?.primaryColor ?? '#3b82f6'}
                onChange={(e) => updateLink(link.id, { color: e.target.value })}
                title="Button color"
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
              />
              <button
                onClick={() => removeLink(link.id)}
                className="p-1.5 text-red-400 hover:text-red-600 transition-colors"
                aria-label="Delete link"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addLink}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Add link
        </button>
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
    </section>
  )
}
