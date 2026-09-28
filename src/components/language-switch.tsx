import { Button } from '@/components/ui/button'
import { useLocale } from '@/lib/use-locale'
import type { Language } from '@/lib/messages'
import { cn } from '@/lib/utils'

const OPTIONS: { code: Language; lang: string }[] = [
  { code: 'en', lang: 'en' },
  { code: 'zh', lang: 'zh-CN' },
]

export function LanguageSwitch() {
  const { language, setLanguage, m } = useLocale()

  return (
    <div
      role="group"
      aria-label={m.language.label}
      className="inline-flex shrink-0 rounded-lg border bg-background p-0.5"
    >
      {OPTIONS.map(({ code, lang }) => {
        const selected = language === code
        return (
          <Button
            key={code}
            type="button"
            size="sm"
            variant={selected ? 'secondary' : 'ghost'}
            aria-pressed={selected}
            lang={lang}
            className={cn('min-w-16', !selected && 'text-muted-foreground')}
            onClick={() => setLanguage(code)}
          >
            {m.language[code]}
          </Button>
        )
      })}
    </div>
  )
}
