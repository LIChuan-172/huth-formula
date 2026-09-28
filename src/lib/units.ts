export type UnitSystem = 'si' | 'imperial'

export interface UnitLabels {
  length: string
  modulus: string
  compliance: string
  stiffness: string
}

export const UNIT_LABELS: Record<UnitSystem, UnitLabels> = {
  si: { length: 'mm', modulus: 'MPa', compliance: 'mm/N', stiffness: 'N/mm' },
  imperial: { length: 'in', modulus: 'psi', compliance: 'in/lbf', stiffness: 'lbf/in' },
}

export const MM_PER_INCH = 25.4
export const PSI_PER_MPA = 145.037737730
export const LBF_PER_NEWTON = 0.224808943100

/** Converts a length between unit systems. */
export function convertLength(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  return from === 'si' ? value / MM_PER_INCH : value * MM_PER_INCH
}

/** Converts a modulus/stress between MPa and psi. */
export function convertModulus(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  return from === 'si' ? value * PSI_PER_MPA : value / PSI_PER_MPA
}

/** Converts a stiffness between N/mm and lbf/in. */
export function convertStiffness(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  const lbfPerInPerNPerMm = LBF_PER_NEWTON * MM_PER_INCH
  return from === 'si' ? value * lbfPerInPerNPerMm : value / lbfPerInPerNPerMm
}

/** Converts a compliance between mm/N and in/lbf. */
export function convertCompliance(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value
  // compliance is the reciprocal of stiffness
  return 1 / convertStiffness(1 / value, from, to)
}

/**
 * Formats a number for display: fixed notation for values in a readable
 * range, otherwise scientific notation with a proper multiplication sign.
 */
export function formatNumber(value: number, significant = 4): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return '0'
  const magnitude = Math.abs(value)
  if (magnitude >= 1e-3 && magnitude < 1e7) {
    const digits = Math.max(0, significant - 1 - Math.floor(Math.log10(magnitude)))
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: Math.min(digits, 20),
    })
  }
  const [mantissa, exponent] = value.toExponential(significant - 1).split('e')
  return `${mantissa} × 10${toSuperscript(Number(exponent))}`
}

const SUPERSCRIPTS: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}

function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((ch) => SUPERSCRIPTS[ch] ?? ch)
    .join('')
}
