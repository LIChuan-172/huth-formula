import {
  getJointPreset,
  validateHuthInput,
  type HuthField,
  type HuthInput,
  type JointPresetId,
  type ShearType,
  type ValidationErrors,
} from './huth'

export type JointSelection = JointPresetId | 'custom'

export interface FormState {
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

/** 2 mm and 3 mm aluminium sheets joined by a 5 mm titanium bolt. */
export function defaultFormState(): FormState {
  return {
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
