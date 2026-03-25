import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteConfig } from '../types'

export function useConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('config')
      .select('data')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setConfig(data.data as SiteConfig)
        setLoading(false)
      })
  }, [])

  const saveSection = useCallback(
    async <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
      if (!config) throw new Error('Config not loaded')
      const updated: SiteConfig = { ...config, [key]: value }
      const { data, error } = await supabase
        .from('config')
        .update({ data: updated })
        .eq('id', 1)
        .select('data')
        .single()
      if (error) throw error
      setConfig(data.data as SiteConfig)
    },
    [config],
  )

  return { config, loading, error, saveSection }
}
