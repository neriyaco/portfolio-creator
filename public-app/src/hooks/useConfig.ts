import { useState, useEffect } from 'react'
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

  return { config, loading, error }
}
