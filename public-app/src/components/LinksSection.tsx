import type { SiteLink } from '../types'
import LinkCard from './LinkCard'

interface Props {
  links?: SiteLink[]
}

export default function LinksSection({ links }: Props) {
  const visible = (links ?? []).filter((l) => l.visible)
  if (visible.length === 0) return null
  return (
    <div className="w-full flex flex-col gap-3">
      {visible.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  )
}
