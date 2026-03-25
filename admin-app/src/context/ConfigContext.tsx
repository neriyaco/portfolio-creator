import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { SiteConfig } from '../types'

interface ConfigContextValue {
  config: SiteConfig | null
  loading: boolean
  error: string | null
  saveSection: <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => Promise<void>
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
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

  // Uses the update_config_section RPC which does an atomic jsonb merge
  // (data || jsonb_build_object(key, value)) so concurrent saves from
  // different editor sections never overwrite each other.
  const saveSection = useCallback(async <K extends keyof SiteConfig>(
    key: K,
    value: SiteConfig[K],
  ) => {
    const { data, error } = await supabase.rpc('update_config_section', {
      section_key: key as string,
      section_value: value,
    })
    if (error) throw error
    setConfig(data as SiteConfig)
  }, [])

  return (
    <ConfigContext.Provider value={{ config, loading, error, saveSection }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within <ConfigProvider>')
  return ctx
}
