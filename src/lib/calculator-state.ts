import {
  getJointPreset,
  validateHuthInput,
  type HuthField,
  type HuthInput,
  type JointPresetId,
  type ShearType,
  type ValidationErrors,
} from './huth'
import { convertLength, convertModulus, type UnitSystem } from './units'

export type JointSelection = JointPresetId | 'custom'

export interface FormState {
  units: UnitSystem
  shear: ShearType
  joint: JointSelection
  t1: string
  t2: string
  d: string
  E1: string
  E2: string
  Ef: string
  /** Custom exponent, only used when joint === 'custom'. */
  a: string
  /** Custom coefficient, only used when joint === 'custom'. */
  b: string
}

export const LENGTH_FIELDS = ['t1', 't2', 'd'] as const
export const MODULUS_FIELDS = ['E1', 'E2', 'Ef'] as const

/** 2 mm and 3 mm aluminium sheets joined by a 5 mm titanium bolt. */
export function defaultFormState(): FormState {
  return {
    units: 'si',
    shear: 'single',
    joint: 'bolted-metallic',
    t1: '2',
    t2: '3',
    d: '5',
    E1: '72000',
    E2: '72000',
    Ef: '110000',
    a: '0.6667',
    b: '3',
  }
}

/** Formats a converted value with enough precision to round-trip visually. */
export function formatInputValue(value: number): string {
  if (!Number.isFinite(value)) return ''
  return String(Number(value.toPrecision(6)))
}

/** Converts every dimensional field of the form to a new unit system. */
export function convertFormUnits(state: FormState, units: UnitSystem): FormState {
  if (state.units === units) return state
  const next: FormState = { ...state, units }
  for (const key of LENGTH_FIELDS) {
    const value = Number(state[key])
    if (state[key].trim() !== '' && Number.isFinite(value)) {
      next[key] = formatInputValue(convertLength(value, state.units, units))
    }
  }
  for (const key of MODULUS_FIELDS) {
    const value = Number(state[key])
    if (state[key].trim() !== '' && Number.isFinite(value)) {
      next[key] = formatInputValue(convertModulus(value, state.units, units))
    }
  }
  return next
}

export interface ParsedForm {
  input: HuthInput
  errors: ValidationErrors
  isValid: boolean
}

const FIELD_LABELS: Record<HuthField, string> = {
  t1: 'Plate 1 thickness',
  t2: 'Plate 2 thickness',
  d: 'Fastener diameter',
  E1: 'Plate 1 modulus',
  E2: 'Plate 2 modulus',
  Ef: 'Fastener modulus',
  a: 'Exponent a',
  b: 'Coefficient b',
}

function parseField(raw: string): number {
  const trimmed = raw.trim().replace(/,/g, '')
  if (trimmed === '') return Number.NaN
  return Number(trimmed)
}

/** Parses the text inputs into a HuthInput and collects validation messages. */
export function parseForm(state: FormState): ParsedForm {
  const preset = state.joint === 'custom' ? null : getJointPreset(state.joint)
  const input: HuthInput = {
    t1: parseField(state.t1),
    t2: parseField(state.t2),
    d: parseField(state.d),
    E1: parseField(state.E1),
    E2: parseField(state.E2),
    Ef: parseField(state.Ef),
    shear: state.shear,
    a: preset ? preset.a : parseField(state.a),
    b: preset ? preset.b : parseField(state.b),
  }

  const errors = validateHuthInput(input)
  // Give a friendlier message for fields the user left blank.
  for (const key of Object.keys(FIELD_LABELS) as HuthField[]) {
    if (preset && (key === 'a' || key === 'b')) continue
    if (state[key].trim() === '') errors[key] = `${FIELD_LABELS[key]} is required.`
  }

  return { input, errors, isValid: Object.keys(errors).length === 0 }
}
