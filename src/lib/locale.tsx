import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LocaleContext, readStoredLanguage, STORAGE_KEY } from '@/lib/locale-context'
import { MESSAGES, type Language } from '@/lib/messages'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage)
  const m = MESSAGES[language]

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The choice still applies for this visit if storage is unavailable.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title = m.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', m.meta.description)
  }, [language, m])

  const value = useMemo(() => ({ language, setLanguage, m }), [language, setLanguage, m])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
