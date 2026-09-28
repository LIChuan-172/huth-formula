import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { HuthInput, HuthResult, ValidationErrors } from '@/lib/huth'
import { UNIT_LABELS, convertCompliance, convertStiffness, formatNumber, type UnitSystem } from '@/lib/units'

interface ResultsCardProps {
  units: UnitSystem
  input: HuthInput
  result: HuthResult | null
  errors: ValidationErrors
}

function otherSystem(units: UnitSystem): UnitSystem {
  return units === 'si' ? 'imperial' : 'si'
}

function buildSummary(units: UnitSystem, input: HuthInput, result: HuthResult): string {
  const u = UNIT_LABELS[units]
  const lines = [
    'Huth fastener flexibility',
    `t1 = ${input.t1} ${u.length}, t2 = ${input.t2} ${u.length}, d = ${input.d} ${u.length}`,
    `E1 = ${input.E1} ${u.modulus}, E2 = ${input.E2} ${u.modulus}, Ef = ${input.Ef} ${u.modulus}`,
    `${input.shear} shear (n = ${result.n}), a = ${input.a}, b = ${input.b}`,
    `C = ${result.compliance.toPrecision(6)} ${u.compliance}`,
    `k = ${result.stiffness.toPrecision(6)} ${u.stiffness}`,
  ]
  return lines.join('\n')
}

export function ResultsCard({ units, input, result, errors }: ResultsCardProps) {
  const [copied, setCopied] = useState(false)
  const u = UNIT_LABELS[units]
  const other = otherSystem(units)
  const ou = UNIT_LABELS[other]

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copySummary() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(buildSummary(units, input, result))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const errorMessages = Object.values(errors)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Compliance and stiffness of one fastener in shear.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={copySummary} disabled={!result}>
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-5">
        {result ? (
          <>
            <div className="grid gap-3">
              <ResultTile
                label="Stiffness"
                symbol="k"
                value={formatNumber(result.stiffness)}
                unit={u.stiffness}
                secondary={`${formatNumber(convertStiffness(result.stiffness, units, other))} ${ou.stiffness}`}
                emphasis
              />
              <ResultTile
                label="Compliance"
                symbol="C"
                value={formatNumber(result.compliance)}
                unit={u.compliance}
                secondary={`${formatNumber(convertCompliance(result.compliance, units, other))} ${ou.compliance}`}
              />
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Breakdown</h3>
                <Badge variant="secondary" className="font-mono">
                  n = {result.n}
                </Badge>
              </div>
              <dl className="grid gap-2 text-sm">
                <BreakdownRow
                  label={
                    <>
                      Geometry factor ((t<sub>1</sub> + t<sub>2</sub>) / 2d)<sup>a</sup>
                    </>
                  }
                  value={formatNumber(result.geometryFactor)}
                />
                <BreakdownRow label="Joint factor b / n" value={formatNumber(result.jointFactor)} />
                <BreakdownRow
                  label={
                    <>
                      Plate 1 bearing 1 / (t<sub>1</sub>E<sub>1</sub>)
                    </>
                  }
                  value={formatNumber(result.terms.plate1Bearing)}
                  unit={u.compliance}
                  share={result.terms.plate1Bearing / result.bracketSum}
                />
                <BreakdownRow
                  label={
                    <>
                      Plate 2 bearing 1 / (n t<sub>2</sub>E<sub>2</sub>)
                    </>
                  }
                  value={formatNumber(result.terms.plate2Bearing)}
                  unit={u.compliance}
                  share={result.terms.plate2Bearing / result.bracketSum}
                />
                <BreakdownRow
                  label={
                    <>
                      Fastener at plate 1 1 / (2 t<sub>1</sub>E<sub>f</sub>)
                    </>
                  }
                  value={formatNumber(result.terms.fastenerAtPlate1)}
                  unit={u.compliance}
                  share={result.terms.fastenerAtPlate1 / result.bracketSum}
                />
                <BreakdownRow
                  label={
                    <>
                      Fastener at plate 2 1 / (2 n t<sub>2</sub>E<sub>f</sub>)
                    </>
                  }
                  value={formatNumber(result.terms.fastenerAtPlate2)}
                  unit={u.compliance}
                  share={result.terms.fastenerAtPlate2 / result.bracketSum}
                />
                <BreakdownRow
                  label="Bracket sum"
                  value={formatNumber(result.bracketSum)}
                  unit={u.compliance}
                  strong
                />
              </dl>
              <p className="text-xs text-muted-foreground">
                Percentages show each term's share of the bracket sum, i.e. where the flexibility comes from.
              </p>
            </div>
          </>
        ) : (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Check the highlighted inputs</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {errorMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

interface ResultTileProps {
  label: string
  symbol: string
  value: string
  unit: string
  secondary: string
  emphasis?: boolean
}

function ResultTile({ label, symbol, value, unit, secondary, emphasis }: ResultTileProps) {
  return (
    <div className={emphasis ? 'rounded-xl bg-primary p-4 text-primary-foreground' : 'rounded-xl bg-muted p-4'}>
      <div className="flex items-baseline justify-between text-xs uppercase tracking-wide opacity-80">
        <span>{label}</span>
        <span className="font-serif text-sm italic normal-case">{symbol}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-mono text-2xl font-semibold tabular-nums whitespace-nowrap">{value}</span>
        <span className="text-sm opacity-80">{unit}</span>
      </div>
      <div className="mt-1 font-mono text-xs tabular-nums whitespace-nowrap opacity-70">= {secondary}</div>
    </div>
  )
}

interface BreakdownRowProps {
  label: React.ReactNode
  value: string
  unit?: string
  share?: number
  strong?: boolean
}

function BreakdownRow({ label, value, unit, share, strong }: BreakdownRowProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-0.5">
      <dt className={strong ? 'font-medium' : 'text-muted-foreground'}>{label}</dt>
      <dd className="flex items-baseline gap-2 text-right font-mono tabular-nums">
        {share !== undefined && (
          <span className="w-12 text-xs text-muted-foreground">{(share * 100).toFixed(1)}%</span>
        )}
        <span className={strong ? 'font-semibold' : ''}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </dd>
    </div>
  )
}
