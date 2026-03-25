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
  visibleFrom?: string
  visibleUntil?: string
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
  maxHeight?: number
}

export interface Seo {
  title?: string
  description?: string
}

export interface SiteConfig {
  bio: Bio
  links: SiteLink[]
  theme: Theme
  photo: Photo
  logo: Logo
  seo?: Seo
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}
