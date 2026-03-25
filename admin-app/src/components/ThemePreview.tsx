import type { Theme } from '../types'

interface Props {
  theme: Theme
}

export default function ThemePreview({ theme }: Props) {
  const bg = theme.backgroundColor ?? '#ffffff'
  const text = theme.textColor ?? '#111827'
  const primary = theme.primaryColor ?? '#3b82f6'
  const font = theme.fontFamily ?? 'system-ui, sans-serif'

  return (
    <div
      className="rounded-xl border border-gray-200 overflow-hidden"
      style={{ backgroundColor: bg, color: text, fontFamily: font }}
    >
      <div className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-gray-300 mb-4" />
        <p className="text-lg font-bold mb-1" style={{ color: text }}>
          Your Name
        </p>
        <p className="text-sm opacity-70 mb-4">Your tagline goes here</p>
        <div className="w-full flex flex-col gap-2">
          {['GitHub', 'Twitter', 'LinkedIn'].map((label) => (
            <div
              key={label}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: primary, color: '#fff' }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
