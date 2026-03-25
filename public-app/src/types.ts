export interface Bio {
  name?: string
  tagline?: string
  body?: string
}

export interface SiteLink {
  id: string
  label: string
  url: string
  icon: string
  color?: string
  visible: boolean
}

export interface Theme {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
}

export interface Photo {
  resourceId?: string
  url?: string
  alt?: string
}

export interface Logo {
  resourceId?: string
  url?: string
  alt?: string
}

export interface SiteConfig {
  bio: Bio
  links: SiteLink[]
  theme: Theme
  photo: Photo
  logo: Logo
}
