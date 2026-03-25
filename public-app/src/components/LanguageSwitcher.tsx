import { useI18n } from '../i18n/i18n-react'
import type { Locales } from '../i18n/i18n-types'

const LOCALES: { code: Locales; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'עב' },
]

interface Props {
  availableLocales?: string[]
}

export default function LanguageSwitcher({ availableLocales }: Props) {
  const { locale, setLocale } = useI18n()

  const visible = availableLocales
    ? LOCALES.filter((l) => availableLocales.includes(l.code))
    : LOCALES

  if (visible.length <= 1) return null

  return (
    <div className="flex items-center gap-0.5 text-xs mt-6">
      {visible.map((l, i) => (
        <span key={l.code} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-gray-200 select-none px-0.5">|</span>}
          <button
            onClick={() => setLocale(l.code)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              locale === l.code
                ? 'text-gray-700 font-semibold'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  )
}
