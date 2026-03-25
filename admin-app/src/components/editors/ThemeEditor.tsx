import { useState, useEffect } from 'react'
import { useConfig } from '../../hooks/useConfig'
import ThemePreview from '../ThemePreview'
import type { Theme } from '../../types'

type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export default function ThemeEditor() {
  const { config, saveSection } = useConfig()
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'system-ui, sans-serif',
  })
  const [status, setStatus] = useState<SaveStatus>('idle')

  useEffect(() => {
    if (config?.theme) setTheme(config.theme)
  }, [config])

  async function handleSave() {
    setStatus('saving')
    try {
      await saveSection('theme', theme)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2500)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Theme</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <ColorField
            label="Primary Color"
            value={theme.primaryColor ?? '#3b82f6'}
            onChange={(v) => setTheme({ ...theme, primaryColor: v })}
          />
          <ColorField
            label="Background Color"
            value={theme.backgroundColor ?? '#ffffff'}
            onChange={(v) => setTheme({ ...theme, backgroundColor: v })}
          />
          <ColorField
            label="Text Color"
            value={theme.textColor ?? '#111827'}
            onChange={(v) => setTheme({ ...theme, textColor: v })}
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Font Family
            </label>
            <input
              type="text"
              value={theme.fontFamily ?? ''}
              onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
              placeholder="system-ui, sans-serif"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
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

        {/* Live preview */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-500">Preview</p>
          <ThemePreview theme={theme} />
        </div>
      </div>
    </section>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
