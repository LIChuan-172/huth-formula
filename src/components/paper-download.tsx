import { useEffect, useMemo } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { embeddedGuideUrl } from '@/lib/offline-copy'
import { useLocale } from '@/lib/use-locale'

const GUIDE_FILES = {
  en: 'huth-guide.pdf',
  zh: 'huth-guide.zh.pdf',
} as const

export function PaperDownload() {
  const { language, m } = useLocale()
  const file = GUIDE_FILES[language]
  const embedded = useMemo(() => embeddedGuideUrl(language), [language])
  useEffect(() => {
    if (!embedded) return
    return () => URL.revokeObjectURL(embedded)
  }, [embedded])
  const href = embedded ?? `${import.meta.env.BASE_URL}downloads/${file}`

  return (
    <Button variant="default" size="sm" asChild>
      <a href={href} download={file}>
        <Download />
        {m.header.guide}
      </a>
    </Button>
  )
}
