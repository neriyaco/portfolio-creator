import { supabase } from '../lib/supabase'
import type { SiteLink } from '../types'
import LinkCard from './LinkCard'

interface Props {
  links?: SiteLink[]
}

function isScheduledVisible(link: SiteLink): boolean {
  const now = new Date()
  if (link.visibleFrom && new Date(link.visibleFrom) > now) return false
  if (link.visibleUntil && new Date(link.visibleUntil) < now) return false
  return true
}

function recordClick(linkId: string) {
  // Fire-and-forget — does not block navigation
  supabase.from('link_clicks').insert({ link_id: linkId }).then(() => {})
}

export default function LinksSection({ links }: Props) {
  const visible = (links ?? []).filter((l) => l.visible && isScheduledVisible(l))
  if (visible.length === 0) return null
  return (
    <div className="w-full flex flex-col gap-3">
      {visible.map((link) => (
        <LinkCard key={link.id} link={link} onClick={() => recordClick(link.id)} />
      ))}
    </div>
  )
}
