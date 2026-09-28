import { describe, expect, it } from 'vitest'
import { formatNumber } from './units'

describe('formatNumber', () => {
  it('uses fixed notation in a readable range', () => {
    expect(formatNumber(34444.43)).toBe('34,444')
    expect(formatNumber(0.6299605)).toBe('0.63')
    expect(formatNumber(1.5)).toBe('1.5')
  })

  it('uses scientific notation for very small or large values', () => {
    expect(formatNumber(2.90323e-5)).toBe('2.903 × 10⁻⁵')
    expect(formatNumber(1.2e9)).toBe('1.200 × 10⁹')
  })

  it('handles zero and non-finite input', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(Number.NaN)).toBe('—')
  })
})
