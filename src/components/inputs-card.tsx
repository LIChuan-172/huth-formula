import { RotateCcw } from 'lucide-react'
import { NumberField } from '@/components/number-field'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { FormState, JointSelection } from '@/lib/calculator-state'
import { JOINT_PRESETS, type HuthField, type ShearType, type ValidationErrors } from '@/lib/huth'
import { localizeFieldError } from '@/lib/localize-error'
import { useLocale } from '@/lib/use-locale'
import { METRIC_UNITS } from '@/lib/units'

interface InputsCardProps {
  state: FormState
  errors: ValidationErrors
  onFieldChange: (field: keyof FormState, value: string) => void
  onReset: () => void
}

function Symbol({ base, sub }: { base: string; sub: string }) {
  return (
    <span className="font-serif italic">
      {base}
      <sub className="not-italic">{sub}</sub>
    </span>
  )
}

export function InputsCard({ state, errors, onFieldChange, onReset }: InputsCardProps) {
  const { m } = useLocale()
  const isCustom = state.joint === 'custom'
  const fieldError = (field: HuthField) => (errors[field] ? localizeFieldError(field, errors[field], m) : undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.inputs.title}</CardTitle>
        <CardDescription>{m.inputs.description}</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw data-icon="inline-start" />
            {m.inputs.reset}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-1.5">
            <Label id="shear-label">{m.inputs.shear}</Label>
            <Tabs value={state.shear} onValueChange={(value) => onFieldChange('shear', value as ShearType)}>
              <TabsList className="w-full" aria-labelledby="shear-label">
                <TabsTrigger value="single">{m.inputs.shearSingle}</TabsTrigger>
                <TabsTrigger value="double">{m.inputs.shearDouble}</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {state.shear === 'single' ? m.inputs.shearSingleHint : m.inputs.shearDoubleHint}
            </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="joint-type">{m.inputs.joint}</Label>
          <Select value={state.joint} onValueChange={(value) => onFieldChange('joint', value as JointSelection)}>
            <SelectTrigger id="joint-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOINT_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {m.presets[preset.id].label}
                  <span className="ml-auto pl-3 font-mono text-xs text-muted-foreground">
                    a = {preset.a === 2 / 3 ? '2/3' : '2/5'}, b = {preset.b.toFixed(1)}
                  </span>
                </SelectItem>
              ))}
              <SelectItem value="custom">{m.inputs.custom}</SelectItem>
            </SelectContent>
          </Select>
          {!isCustom && state.joint !== 'custom' && (
            <p className="text-xs text-muted-foreground">{m.presets[state.joint].description}</p>
          )}
        </div>

        {isCustom && (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="a"
              label={
                <>
                  {m.inputs.exponent} <span className="font-serif italic">a</span>
                </>
              }
              value={state.a}
              onChange={(value) => onFieldChange('a', value)}
              error={fieldError('a')}
              hint={m.inputs.exponentHint}
            />
            <NumberField
              id="b"
              label={
                <>
                  {m.inputs.coefficient} <span className="font-serif italic">b</span>
                </>
              }
              value={state.b}
              onChange={(value) => onFieldChange('b', value)}
              error={fieldError('b')}
              hint={m.inputs.coefficientHint}
            />
          </div>
        )}

        <Separator />

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-sm font-medium">{m.inputs.geometry}</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              id="t1"
              label={
                <>
                  {m.fields.t1} <Symbol base="t" sub="1" />
                </>
              }
              unit={METRIC_UNITS.length}
              value={state.t1}
              onChange={(value) => onFieldChange('t1', value)}
              error={fieldError('t1')}
            />
            <NumberField
              id="t2"
              label={
                <>
                  {m.fields.t2} <Symbol base="t" sub="2" />
                </>
              }
              unit={METRIC_UNITS.length}
              value={state.t2}
              onChange={(value) => onFieldChange('t2', value)}
              error={fieldError('t2')}
            />
            <NumberField
              id="d"
              label={
                <>
                  {m.fields.d} <span className="font-serif italic">d</span>
                </>
              }
              unit={METRIC_UNITS.length}
              value={state.d}
              onChange={(value) => onFieldChange('d', value)}
              error={fieldError('d')}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-sm font-medium">{m.inputs.materials}</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              id="E1"
              label={
                <>
                  {m.fields.E1} <Symbol base="E" sub="1" />
                </>
              }
              unit={METRIC_UNITS.modulus}
              value={state.E1}
              onChange={(value) => onFieldChange('E1', value)}
              error={fieldError('E1')}
            />
            <NumberField
              id="E2"
              label={
                <>
                  {m.fields.E2} <Symbol base="E" sub="2" />
                </>
              }
              unit={METRIC_UNITS.modulus}
              value={state.E2}
              onChange={(value) => onFieldChange('E2', value)}
              error={fieldError('E2')}
            />
            <NumberField
              id="Ef"
              label={
                <>
                  {m.fields.Ef} <Symbol base="E" sub="f" />
                </>
              }
              unit={METRIC_UNITS.modulus}
              value={state.Ef}
              onChange={(value) => onFieldChange('Ef', value)}
              error={fieldError('Ef')}
            />
          </div>
          <p className="text-xs text-muted-foreground">{m.inputs.typicalSi}</p>
        </fieldset>
      </CardContent>
    </Card>
  )
}
