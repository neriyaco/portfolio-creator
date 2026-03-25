import { useState, useEffect } from 'react'
import { useConfig } from '../../hooks/useConfig'
import type { Bio } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export default function BioEditor() {
  const { config, saveSection } = useConfig()
  const [bio, setBio] = useState<Bio>({ name: '', tagline: '', body: '' })
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (config?.bio) setBio(config.bio)
  }, [config])

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('bio', bio)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Bio</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
          <input
            type="text"
            value={bio.name ?? ''}
            onChange={(e) => setBio({ ...bio, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tagline</label>
          <input
            type="text"
            value={bio.tagline ?? ''}
            onChange={(e) => setBio({ ...bio, tagline: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Body</label>
          <textarea
            rows={5}
            value={bio.body ?? ''}
            onChange={(e) => setBio({ ...bio, body: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
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
