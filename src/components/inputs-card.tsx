import { RotateCcw } from 'lucide-react'
import { NumberField } from '@/components/number-field'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { FormState, JointSelection } from '@/lib/calculator-state'
import { JOINT_PRESETS, type ShearType, type ValidationErrors } from '@/lib/huth'
import { UNIT_LABELS, type UnitSystem } from '@/lib/units'

interface InputsCardProps {
  state: FormState
  errors: ValidationErrors
  onFieldChange: (field: keyof FormState, value: string) => void
  onUnitsChange: (units: UnitSystem) => void
  onReset: () => void
}

const TYPICAL_MODULI: Record<UnitSystem, string> = {
  si: 'Typical: aluminium 72 000, titanium 110 000, steel 210 000 MPa.',
  imperial: 'Typical: aluminium 10.5e6, titanium 16e6, steel 30e6 psi.',
}

function Symbol({ base, sub }: { base: string; sub: string }) {
  return (
    <span className="font-serif italic">
      {base}
      <sub className="not-italic">{sub}</sub>
    </span>
  )
}

export function InputsCard({ state, errors, onFieldChange, onUnitsChange, onReset }: InputsCardProps) {
  const units = UNIT_LABELS[state.units]
  const isCustom = state.joint === 'custom'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Joint definition</CardTitle>
        <CardDescription>
          Results update as you type. Plate 2 is the middle plate in a double-shear joint.
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw data-icon="inline-start" />
            Reset
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label id="units-label">Unit system</Label>
            <Tabs value={state.units} onValueChange={(value) => onUnitsChange(value as UnitSystem)}>
              <TabsList className="w-full" aria-labelledby="units-label">
                <TabsTrigger value="si">SI (mm, MPa)</TabsTrigger>
                <TabsTrigger value="imperial">Imperial (in, psi)</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">Switching units converts the values you have entered.</p>
          </div>
          <div className="grid gap-1.5">
            <Label id="shear-label">Shear configuration</Label>
            <Tabs value={state.shear} onValueChange={(value) => onFieldChange('shear', value as ShearType)}>
              <TabsList className="w-full" aria-labelledby="shear-label">
                <TabsTrigger value="single">Single shear (n = 1)</TabsTrigger>
                <TabsTrigger value="double">Double shear (n = 2)</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground">
              {state.shear === 'single'
                ? 'Two plates, one shear plane through the fastener.'
                : 'Three plates, two shear planes; plate 2 is the centre plate.'}
            </p>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="joint-type">Joint type</Label>
          <Select value={state.joint} onValueChange={(value) => onFieldChange('joint', value as JointSelection)}>
            <SelectTrigger id="joint-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOINT_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                  <span className="ml-auto pl-3 font-mono text-xs text-muted-foreground">
                    a = {preset.a === 2 / 3 ? '2/3' : '2/5'}, b = {preset.b.toFixed(1)}
                  </span>
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom constants</SelectItem>
            </SelectContent>
          </Select>
          {!isCustom && (
            <p className="text-xs text-muted-foreground">
              {JOINT_PRESETS.find((preset) => preset.id === state.joint)?.description}
            </p>
          )}
        </div>

        {isCustom && (
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              id="a"
              label={
                <>
                  Exponent <span className="font-serif italic">a</span>
                </>
              }
              value={state.a}
              onChange={(value) => onFieldChange('a', value)}
              error={errors.a}
              hint="Huth used 2/3 for bolts and 2/5 for rivets."
            />
            <NumberField
              id="b"
              label={
                <>
                  Coefficient <span className="font-serif italic">b</span>
                </>
              }
              value={state.b}
              onChange={(value) => onFieldChange('b', value)}
              error={errors.b}
              hint="Huth used 3.0 (bolted metal), 2.2 (riveted) and 4.2 (bolted composite)."
            />
          </div>
        )}

        <Separator />

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-sm font-medium">Geometry</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              id="t1"
              label={
                <>
                  Plate 1 thickness <Symbol base="t" sub="1" />
                </>
              }
              unit={units.length}
              value={state.t1}
              onChange={(value) => onFieldChange('t1', value)}
              error={errors.t1}
            />
            <NumberField
              id="t2"
              label={
                <>
                  Plate 2 thickness <Symbol base="t" sub="2" />
                </>
              }
              unit={units.length}
              value={state.t2}
              onChange={(value) => onFieldChange('t2', value)}
              error={errors.t2}
            />
            <NumberField
              id="d"
              label={
                <>
                  Fastener diameter <span className="font-serif italic">d</span>
                </>
              }
              unit={units.length}
              value={state.d}
              onChange={(value) => onFieldChange('d', value)}
              error={errors.d}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-sm font-medium">Materials</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField
              id="E1"
              label={
                <>
                  Plate 1 modulus <Symbol base="E" sub="1" />
                </>
              }
              unit={units.modulus}
              value={state.E1}
              onChange={(value) => onFieldChange('E1', value)}
              error={errors.E1}
            />
            <NumberField
              id="E2"
              label={
                <>
                  Plate 2 modulus <Symbol base="E" sub="2" />
                </>
              }
              unit={units.modulus}
              value={state.E2}
              onChange={(value) => onFieldChange('E2', value)}
              error={errors.E2}
            />
            <NumberField
              id="Ef"
              label={
                <>
                  Fastener modulus <Symbol base="E" sub="f" />
                </>
              }
              unit={units.modulus}
              value={state.Ef}
              onChange={(value) => onFieldChange('Ef', value)}
              error={errors.Ef}
            />
          </div>
          <p className="text-xs text-muted-foreground">{TYPICAL_MODULI[state.units]}</p>
        </fieldset>
      </CardContent>
    </Card>
  )
}
