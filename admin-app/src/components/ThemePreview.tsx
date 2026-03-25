import type { Theme, Bio, SiteLink, Photo } from '../types'

interface Props {
  theme: Theme
  bio?: Bio
  links?: SiteLink[]
  photo?: Photo
}

const FALLBACK_LINKS = ['GitHub', 'Twitter', 'LinkedIn']

export default function ThemePreview({ theme, bio, links, photo }: Props) {
  const bg = theme.backgroundColor ?? '#ffffff'
  const text = theme.textColor ?? '#111827'
  const primary = theme.primaryColor ?? '#3b82f6'
  const font = theme.fontFamily ?? 'system-ui, sans-serif'

  const visibleLinks = links?.filter((l) => l.visible) ?? []

  return (
    <div
      className="rounded-xl border border-gray-200 overflow-hidden"
      style={{ backgroundColor: bg, color: text, fontFamily: font }}
    >
      <div className="p-6 flex flex-col items-center text-center">
        {photo?.url ? (
          <img
            src={photo.url}
            alt={photo.alt ?? ''}
            className="w-16 h-16 rounded-full object-cover mb-4"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300 mb-4" />
        )}
        <p className="text-lg font-bold mb-1" style={{ color: text }}>
          {bio?.name || 'Your Name'}
        </p>
        <p className="text-sm opacity-70 mb-4">{bio?.tagline || 'Your tagline goes here'}</p>
        <div className="w-full flex flex-col gap-2">
          {visibleLinks.length > 0
            ? visibleLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: link.color ?? primary, color: '#fff' }}
                >
                  {link.label || 'Link'}
                </div>
              ))
            : FALLBACK_LINKS.map((label) => (
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
