import type { Photo } from '../types'

interface Props {
  photo?: Photo
}

export default function PhotoSection({ photo }: Props) {
  if (!photo?.url) return null
  return (
    <div className="mb-8">
      <img
        src={photo.url}
        alt={photo.alt ?? 'Profile photo'}
        className="w-32 h-32 rounded-full object-cover shadow-md"
      />
    </div>
  )
}
