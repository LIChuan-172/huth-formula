import { useContext } from 'react'
import { LocaleContext, type LocaleContextValue } from '@/lib/locale-context'

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext)
  if (!value) throw new Error('useLocale must be used within LanguageProvider')
  return value
}
