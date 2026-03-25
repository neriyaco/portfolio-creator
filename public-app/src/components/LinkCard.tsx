import * as LucideIcons from 'lucide-react'
import type { SiteLink } from '../types'

type IconName = keyof typeof LucideIcons

function resolveIcon(name?: string): React.ComponentType<{ size?: number }> {
  if (name && name in LucideIcons) {
    return LucideIcons[name as IconName] as React.ComponentType<{ size?: number }>
  }
  return LucideIcons.Link as React.ComponentType<{ size?: number }>
}

interface Props {
  link: SiteLink
}

export default function LinkCard({ link }: Props) {
  const Icon = resolveIcon(link.icon)
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-xl font-medium transition-opacity hover:opacity-80 shadow-sm"
      style={{ backgroundColor: link.color ?? 'var(--color-primary)', color: '#ffffff' }}
    >
      <Icon size={20} />
      <span>{link.label}</span>
    </a>
  )
}
