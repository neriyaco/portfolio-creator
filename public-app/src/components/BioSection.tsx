import type { Bio } from '../types'

interface Props {
  bio?: Bio
}

export default function BioSection({ bio }: Props) {
  if (!bio) return null
  return (
    <div className="text-center mb-10">
      {bio.name && (
        <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {bio.name}
        </h1>
      )}
      {bio.tagline && <p className="text-lg mb-3 opacity-70">{bio.tagline}</p>}
      {bio.body && (
        <div
          className="text-base leading-relaxed max-w-prose mx-auto opacity-80 bio-body"
          dangerouslySetInnerHTML={{ __html: bio.body }}
        />
      )}
    </div>
  )
}
