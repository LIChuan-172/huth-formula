/**
 * Huth fastener flexibility (compliance) model.
 *
 * Reference: H. Huth, "Influence of Fastener Flexibility on the Prediction of
 * Load Transfer and Fatigue Life for Multiple-Row Joints", ASTM STP 927, 1986
 * (eq. 31 of the original 1984 LBF report FB-172).
 *
 *   C = ((t1 + t2) / (2 d))^a · (b / n) · [ 1/(t1 E1) + 1/(n t2 E2) + 1/(2 t1 Ef) + 1/(2 n t2 Ef) ]
 *   k = 1 / C
 *
 * Note: the ASTM STP 927 reprint contains a typographical error (an "n" in
 * place of the "2" in the third term). This implementation follows the
 * original, symmetric form above, which gives the same result regardless of
 * which plate is labelled 1 or 2 in single shear.
 */

export type ShearType = 'single' | 'double'

export type JointPresetId = 'bolted-metallic' | 'riveted-metallic' | 'bolted-composite'

export interface JointPreset {
  id: JointPresetId
  label: string
  description: string
  a: number
  b: number
}

export const JOINT_PRESETS: readonly JointPreset[] = [
  {
    id: 'bolted-metallic',
    label: 'Bolted, metallic plates',
    description: 'Bolts through aluminium, titanium or steel sheets.',
    a: 2 / 3,
    b: 3.0,
  },
  {
    id: 'riveted-metallic',
    label: 'Riveted, metallic plates',
    description: 'Solid rivets through metallic sheets.',
    a: 2 / 5,
    b: 2.2,
  },
  {
    id: 'bolted-composite',
    label: 'Bolted, graphite/epoxy plates',
    description: 'Bolts through carbon-fibre reinforced laminates.',
    a: 2 / 3,
    b: 4.2,
  },
]

export function getJointPreset(id: JointPresetId): JointPreset {
  const preset = JOINT_PRESETS.find((p) => p.id === id)
  if (!preset) throw new Error(`Unknown joint preset: ${id}`)
  return preset
}

/** Number of shear planes for a given joint configuration. */
export function shearPlanes(shear: ShearType): 1 | 2 {
  return shear === 'double' ? 2 : 1
}

/**
 * All quantities are metric: thicknesses and diameter in mm, moduli in MPa (N/mm²),
 * giving C in mm/N and k in N/mm.
 */
export interface HuthInput {
  /** Thickness of plate 1 (outer plate in double shear). */
  t1: number
  /** Thickness of plate 2 (middle plate in double shear). */
  t2: number
  /** Fastener shank diameter. */
  d: number
  /** Young's modulus of plate 1. */
  E1: number
  /** Young's modulus of plate 2. */
  E2: number
  /** Young's modulus of the fastener. */
  Ef: number
  shear: ShearType
  /** Geometry exponent. */
  a: number
  /** Joint-type coefficient. */
  b: number
}

export interface HuthTerms {
  /** 1 / (t1 E1): bearing of plate 1. */
  plate1Bearing: number
  /** 1 / (n t2 E2): bearing of plate 2. */
  plate2Bearing: number
  /** 1 / (2 t1 Ef): fastener bearing/bending at plate 1. */
  fastenerAtPlate1: number
  /** 1 / (2 n t2 Ef): fastener bearing/bending at plate 2. */
  fastenerAtPlate2: number
}

export interface HuthResult {
  /** Shear planes, 1 or 2. */
  n: 1 | 2
  /** ((t1 + t2) / (2 d))^a */
  geometryFactor: number
  /** b / n */
  jointFactor: number
  terms: HuthTerms
  /** Sum of the four bracket terms. */
  bracketSum: number
  /** Fastener compliance C. */
  compliance: number
  /** Fastener stiffness k = 1 / C. */
  stiffness: number
}

export type HuthField = keyof Omit<HuthInput, 'shear'>

export type ValidationErrors = Partial<Record<HuthField, string>>

const POSITIVE_FIELDS: readonly { key: HuthField; label: string }[] = [
  { key: 't1', label: 'Plate 1 thickness' },
  { key: 't2', label: 'Plate 2 thickness' },
  { key: 'd', label: 'Fastener diameter' },
  { key: 'E1', label: 'Plate 1 modulus' },
  { key: 'E2', label: 'Plate 2 modulus' },
  { key: 'Ef', label: 'Fastener modulus' },
  { key: 'b', label: 'Coefficient b' },
]

/**
 * Returns a map of field → message for every invalid field. An empty object
 * means the input is valid.
 */
export function validateHuthInput(input: HuthInput): ValidationErrors {
  const errors: ValidationErrors = {}
  for (const { key, label } of POSITIVE_FIELDS) {
    const value = input[key]
    if (!Number.isFinite(value)) {
      errors[key] = `${label} must be a number.`
    } else if (value <= 0) {
      errors[key] = `${label} must be greater than zero.`
    }
  }
  if (!Number.isFinite(input.a)) {
    errors.a = 'Exponent a must be a number.'
  } else if (input.a < 0) {
    errors.a = 'Exponent a must not be negative.'
  }
  return errors
}

export function isValidHuthInput(input: HuthInput): boolean {
  return Object.keys(validateHuthInput(input)).length === 0
}

/**
 * Evaluates the Huth formula and returns the compliance, stiffness and every
 * intermediate factor. Throws if the input fails validation.
 */
export function computeHuth(input: HuthInput): HuthResult {
  const errors = validateHuthInput(input)
  const firstError = Object.values(errors)[0]
  if (firstError) throw new RangeError(firstError)

  const { t1, t2, d, E1, E2, Ef, a, b } = input
  const n = shearPlanes(input.shear)

  const geometryFactor = Math.pow((t1 + t2) / (2 * d), a)
  const jointFactor = b / n

  const terms: HuthTerms = {
    plate1Bearing: 1 / (t1 * E1),
    plate2Bearing: 1 / (n * t2 * E2),
    fastenerAtPlate1: 1 / (2 * t1 * Ef),
    fastenerAtPlate2: 1 / (2 * n * t2 * Ef),
  }
  const bracketSum =
    terms.plate1Bearing + terms.plate2Bearing + terms.fastenerAtPlate1 + terms.fastenerAtPlate2

  const compliance = geometryFactor * jointFactor * bracketSum

  return {
    n,
    geometryFactor,
    jointFactor,
    terms,
    bracketSum,
    compliance,
    stiffness: 1 / compliance,
  }
}

/** Convenience wrapper returning only the compliance C. */
export function huthCompliance(input: HuthInput): number {
  return computeHuth(input).compliance
}

/** Convenience wrapper returning only the stiffness k = 1 / C. */
export function huthStiffness(input: HuthInput): number {
  return computeHuth(input).stiffness
}
