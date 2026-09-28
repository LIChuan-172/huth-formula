import type { Language } from '@/lib/messages'

declare global {
  interface Window {
    /** Set by the self-contained HTML file before the app starts. */
    __HUTH_OFFLINE_COPY__?: boolean
    /** Base64 PDF bytes for the embedded guides, present only in that file. */
    __HUTH_GUIDE_PDFS_B64__?: Partial<Record<Language, string>>
  }
}

export function isOfflineCopy(): boolean {
  return typeof window !== 'undefined' && window.__HUTH_OFFLINE_COPY__ === true
}

/** Object URL for an embedded guide, or null when the page should use the site file. */
export function embeddedGuideUrl(language: Language): string | null {
  if (typeof window === 'undefined') return null
  const encoded = window.__HUTH_GUIDE_PDFS_B64__?.[language]
  if (!encoded) return null
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
}
