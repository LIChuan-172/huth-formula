import { useMemo, useState } from 'react'
import { InputsCard } from '@/components/inputs-card'
import { LanguageSwitch } from '@/components/language-switch'
import { PaperDownload } from '@/components/paper-download'
import { ResultsCard } from '@/components/results-card'
import { defaultFormState, parseForm, type FormState } from '@/lib/calculator-state'
import { computeHuth } from '@/lib/huth'
import { useLocale } from '@/lib/use-locale'

export default function App() {
  const { m } = useLocale()
  const [state, setState] = useState<FormState>(defaultFormState)

  const parsed = useMemo(() => parseForm(state), [state])
  const result = useMemo(() => (parsed.isValid ? computeHuth(parsed.input) : null), [parsed])

  function handleFieldChange(field: keyof FormState, value: string) {
    setState((previous) => ({ ...previous, [field]: value }))
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.header.eyebrow}</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{m.header.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PaperDownload />
              <LanguageSwitch />
            </div>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{m.header.lede}</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:items-start">
        <div className="grid gap-6 lg:col-span-7">
          <InputsCard
            state={state}
            errors={parsed.errors}
            onFieldChange={handleFieldChange}
            onReset={() => setState(defaultFormState())}
          />
        </div>
        <div className="grid gap-6 lg:col-span-5 lg:sticky lg:top-6">
          <ResultsCard input={parsed.input} result={result} errors={parsed.errors} />
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>{m.footer.local}</span>
          <span>{m.footer.disclaimer}</span>
        </div>
      </footer>
    </div>
  )
}
