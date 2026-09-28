import { useMemo, useState } from 'react'
import { Explanation } from '@/components/explanation'
import { InputsCard } from '@/components/inputs-card'
import { ResultsCard } from '@/components/results-card'
import { convertFormUnits, defaultFormState, parseForm, type FormState } from '@/lib/calculator-state'
import { computeHuth } from '@/lib/huth'
import type { UnitSystem } from '@/lib/units'

export default function App() {
  const [state, setState] = useState<FormState>(defaultFormState)

  const parsed = useMemo(() => parseForm(state), [state])
  const result = useMemo(() => (parsed.isValid ? computeHuth(parsed.input) : null), [parsed])

  function handleFieldChange(field: keyof FormState, value: string) {
    setState((previous) => ({ ...previous, [field]: value }))
  }

  function handleUnitsChange(units: UnitSystem) {
    setState((previous) => convertFormUnits(previous, units))
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fastener flexibility</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Huth fastener stiffness calculator</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Estimate the shear compliance and stiffness of a bolt or rivet in a lap joint using Huth&rsquo;s 1986
              formula. Supports single and double shear, metallic and composite plates, SI and imperial units.
            </p>
          </div>
          <a href="#about" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            How the formula works
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:items-start">
        <div className="grid gap-6 lg:col-span-7">
          <InputsCard
            state={state}
            errors={parsed.errors}
            onFieldChange={handleFieldChange}
            onUnitsChange={handleUnitsChange}
            onReset={() => setState(defaultFormState())}
          />
        </div>
        <div className="grid gap-6 lg:col-span-5 lg:sticky lg:top-6">
          <ResultsCard units={state.units} input={parsed.input} result={result} errors={parsed.errors} />
        </div>
        <div className="lg:col-span-12">
          <Explanation />
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>Runs entirely in your browser; nothing you enter is sent anywhere.</span>
          <span>Engineering estimate only. Verify against test data for certification work.</span>
        </div>
      </footer>
    </div>
  )
}
