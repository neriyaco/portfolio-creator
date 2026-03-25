import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TypesafeI18n, useI18n } from './i18n/i18n-react'
import type { Locales } from './i18n/i18n-types'
import { useConfig } from './hooks/useConfig'
import LoadingSkeleton from './components/LoadingSkeleton'
import ErrorState from './components/ErrorState'
import LogoSection from './components/LogoSection'
import PhotoSection from './components/PhotoSection'
import BioSection from './components/BioSection'
import LinksSection from './components/LinksSection'
import RecentPostsSection from './components/RecentPostsSection'
import LanguageSwitcher from './components/LanguageSwitcher'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import type { Theme, Seo } from './types'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor)
  if (theme.backgroundColor) root.style.setProperty('--color-background', theme.backgroundColor)
  if (theme.textColor) root.style.setProperty('--color-text', theme.textColor)
  if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily)
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
  el.content = content
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
  el.content = content
}

function setFavicon(url: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!el) { el = document.createElement('link'); el.rel = 'icon'; document.head.appendChild(el) }
  el.href = url
}

function applySeo(seo: Seo | undefined, fallbackTitle: string | undefined, logoUrl: string | undefined) {
  const title = seo?.title || fallbackTitle || 'Portfolio'
  document.title = title
  setMetaName('description', seo?.description ?? '')
  setMetaProperty('og:title', title)
  setMetaProperty('og:description', seo?.description ?? '')
  if (logoUrl) setFavicon(logoUrl)
}

function I18nEffects() {
  const { locale } = useI18n()
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'he' ? 'rtl' : 'ltr'
    localStorage.setItem('i18n-locale', locale)
  }, [locale])
  return null
}

function PortfolioPage() {
  const { config, loading, error } = useConfig()
  const { setLocale } = useI18n()

  useEffect(() => {
    if (config?.theme) applyTheme(config.theme)
    applySeo(config?.seo, config?.bio?.name, config?.logo?.url)
  }, [config])

  useEffect(() => {
    if (config?.locales?.default && !localStorage.getItem('i18n-locale')) {
      setLocale(config.locales.default as Locales)
    }
  }, [config, setLocale])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4 sm:py-16">
      <div className="w-full max-w-md flex flex-col items-center">
        <LogoSection logo={config?.logo} />
        <PhotoSection photo={config?.photo} />
        <BioSection bio={config?.bio} />
        <LinksSection links={config?.links} />
        <RecentPostsSection />
        <LanguageSwitcher availableLocales={config?.locales?.available} />
      </div>
    </main>
  )
}

export default function App() {
  const initialLocale = (localStorage.getItem('i18n-locale') ?? 'en') as Locales
  return (
    <TypesafeI18n locale={initialLocale}>
      <I18nEffects />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </BrowserRouter>
    </TypesafeI18n>
  )
}
