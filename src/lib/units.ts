export interface UnitLabels {
  length: string
  modulus: string
  compliance: string
  stiffness: string
}

/** Metric labels used throughout the calculator. Lengths are millimetres and moduli are megapascals. */
export const METRIC_UNITS: UnitLabels = {
  length: 'mm',
  modulus: 'MPa',
  compliance: 'mm/N',
  stiffness: 'N/mm',
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
