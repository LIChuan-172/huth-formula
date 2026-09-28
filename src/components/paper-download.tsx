import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/use-locale'

const PAPER_FILES = {
  en: 'huth-formula.pdf',
  zh: 'huth-formula.zh.pdf',
} as const

export function PaperDownload() {
  const { language, m } = useLocale()
  const file = PAPER_FILES[language]
  const href = `${import.meta.env.BASE_URL}paper/${file}`

  return (
    <Button variant="default" size="sm" asChild>
      <a href={href} download={file}>
        <Download />
        {m.header.paper}
      </a>
    </Button>
  )
}
