import { createContext } from 'react'
import type { Language, Messages } from '@/lib/messages'

export const STORAGE_KEY = 'huth-language'

export interface LocaleContextValue {
  language: Language
  setLanguage: (language: Language) => void
  m: Messages
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function readStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
  } catch {
    // Private mode or a blocked storage API: fall through to the browser language.
  }
  const preferred = navigator.language.toLowerCase()
  return preferred.startsWith('zh') ? 'zh' : 'en'
}
