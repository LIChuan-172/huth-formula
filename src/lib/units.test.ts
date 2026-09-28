import { describe, expect, it } from 'vitest'
import { computeHuth } from './huth'
import {
  convertCompliance,
  convertLength,
  convertModulus,
  convertStiffness,
  formatNumber,
} from './units'

describe('unit conversions', () => {
  it('converts length and modulus', () => {
    expect(convertLength(25.4, 'si', 'imperial')).toBeCloseTo(1, 12)
    expect(convertLength(1, 'imperial', 'si')).toBeCloseTo(25.4, 12)
    expect(convertModulus(1, 'si', 'imperial')).toBeCloseTo(145.0377, 4)
    expect(convertModulus(10.5e6, 'imperial', 'si')).toBeCloseTo(72_395, 0)
  })

  it('converts stiffness and compliance consistently', () => {
    expect(convertStiffness(1, 'si', 'imperial')).toBeCloseTo(5.71015, 5)
    expect(convertCompliance(1, 'imperial', 'si')).toBeCloseTo(5.71015, 5)
    expect(convertStiffness(convertStiffness(1234, 'si', 'imperial'), 'imperial', 'si')).toBeCloseTo(1234, 9)
  })

  it('gives the same physical result when the Huth inputs are converted', () => {
    const si = computeHuth({
      t1: 2,
      t2: 3,
      d: 5,
      E1: 72_000,
      E2: 72_000,
      Ef: 110_000,
      shear: 'single',
      a: 2 / 3,
      b: 3,
    })
    const imperial = computeHuth({
      t1: convertLength(2, 'si', 'imperial'),
      t2: convertLength(3, 'si', 'imperial'),
      d: convertLength(5, 'si', 'imperial'),
      E1: convertModulus(72_000, 'si', 'imperial'),
      E2: convertModulus(72_000, 'si', 'imperial'),
      Ef: convertModulus(110_000, 'si', 'imperial'),
      shear: 'single',
      a: 2 / 3,
      b: 3,
    })
    expect(convertStiffness(imperial.stiffness, 'imperial', 'si')).toBeCloseTo(si.stiffness, 6)
  })
})

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
