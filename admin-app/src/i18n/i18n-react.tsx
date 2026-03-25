import { useContext } from 'react'
import { initI18nReact } from 'typesafe-i18n/react'
import type { Locales, Translations } from './i18n-types'
import en from './en'
import he from './he'

const { component: TypesafeI18n, context } = initI18nReact<Locales, Translations>(
  { en, he } as Record<Locales, Translations>,
)

export { TypesafeI18n }

export function useI18n() {
  return useContext(context)
}
