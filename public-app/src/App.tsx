import { useEffect } from 'react'
import { useConfig } from './hooks/useConfig'
import LoadingSkeleton from './components/LoadingSkeleton'
import ErrorState from './components/ErrorState'
import PhotoSection from './components/PhotoSection'
import BioSection from './components/BioSection'
import LinksSection from './components/LinksSection'
import type { Theme } from './types'

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme.primaryColor) root.style.setProperty('--color-primary', theme.primaryColor)
  if (theme.backgroundColor) root.style.setProperty('--color-background', theme.backgroundColor)
  if (theme.textColor) root.style.setProperty('--color-text', theme.textColor)
  if (theme.fontFamily) root.style.setProperty('--font-family', theme.fontFamily)
}

export default function App() {
  const { config, loading, error } = useConfig()

  useEffect(() => {
    if (config?.theme) applyTheme(config.theme)
  }, [config])

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg flex flex-col items-center">
        <PhotoSection photo={config?.photo} />
        <BioSection bio={config?.bio} />
        <LinksSection links={config?.links} />
      </div>
    </main>
  )
}
