import { useState } from 'react'
import { useConfig } from '../../context/ConfigContext'
import { useI18n } from '../../i18n/i18n-react'

const ALL_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'he', label: 'עברית (Hebrew)' },
]

export default function LocaleEditor() {
  const { config, saveSection } = useConfig()
  const { LL } = useI18n()
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const available = config?.locales?.available ?? ['en']
  const defaultLocale = config?.locales?.default ?? 'en'

  function toggleAvailable(code: string) {
    if (available.includes(code)) {
      if (available.length === 1) return // keep at least one
      const next = available.filter((c) => c !== code)
      const newDefault = next.includes(defaultLocale) ? defaultLocale : next[0]
      save(next, newDefault)
    } else {
      save([...available, code], defaultLocale)
    }
  }

  async function save(av: string[], def: string) {
    setStatus('saving')
    try {
      await saveSection('locales', { available: av, default: def })
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{LL.locales.title()}</h2>
        {status === 'success' && <span className="text-sm text-green-600">{LL.editor.saved()}</span>}
        {status === 'error' && <span className="text-sm text-red-600">{LL.editor.saveFailed()}</span>}
        {status === 'saving' && <span className="text-sm text-gray-400">{LL.editor.saving()}</span>}
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{LL.locales.available()}</p>
          <div className="flex flex-col gap-2">
            {ALL_LOCALES.map(({ code, label }) => (
              <label key={code} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={available.includes(code)}
                  onChange={() => toggleAvailable(code)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{LL.locales.default()}</p>
          <div className="flex flex-col gap-2">
            {ALL_LOCALES.filter(({ code }) => available.includes(code)).map(({ code, label }) => (
              <label key={code} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="default-locale"
                  value={code}
                  checked={defaultLocale === code}
                  onChange={() => save(available, code)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
