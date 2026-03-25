import type { Logo } from '../types'

interface Props {
  logo?: Logo
}

export default function LogoSection({ logo }: Props) {
  if (!logo?.url) return null
  return (
    <div className="mb-8 w-full flex justify-center">
      <img
        src={logo.url}
        alt={logo.alt ?? 'Logo'}
        className="max-w-[200px] w-auto object-contain"
        style={{ maxHeight: logo.maxHeight ?? 64 }}
      />
    </div>
  )
}
