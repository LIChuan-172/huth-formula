import { describe, expect, it } from 'vitest'
import { convertFormUnits, defaultFormState, formatInputValue, parseForm } from './calculator-state'

describe('parseForm', () => {
  it('parses the default state into a valid Huth input using the preset constants', () => {
    const parsed = parseForm(defaultFormState())
    expect(parsed.isValid).toBe(true)
    expect(parsed.input).toMatchObject({ t1: 2, t2: 3, d: 5, E1: 72_000, Ef: 110_000, a: 2 / 3, b: 3 })
  })

  it('uses the custom a and b when the custom joint type is selected', () => {
    const parsed = parseForm({ ...defaultFormState(), joint: 'custom', a: '0.5', b: '2.5' })
    expect(parsed.isValid).toBe(true)
    expect(parsed.input.a).toBe(0.5)
    expect(parsed.input.b).toBe(2.5)
  })

  it('reports blank and malformed fields', () => {
    const parsed = parseForm({ ...defaultFormState(), t1: '', d: 'five', joint: 'custom', a: '', b: '-1' })
    expect(parsed.isValid).toBe(false)
    expect(parsed.errors.t1).toBe('Plate 1 thickness is required.')
    expect(parsed.errors.d).toBe('Fastener diameter must be a number.')
    expect(parsed.errors.a).toBe('Exponent a is required.')
    expect(parsed.errors.b).toBe('Coefficient b must be greater than zero.')
  })

  it('accepts thousands separators and scientific notation', () => {
    const parsed = parseForm({ ...defaultFormState(), E1: '72,000', Ef: '1.1e5' })
    expect(parsed.isValid).toBe(true)
    expect(parsed.input.E1).toBe(72_000)
    expect(parsed.input.Ef).toBe(110_000)
  })
})

describe('convertFormUnits', () => {
  it('converts lengths and moduli and leaves everything else untouched', () => {
    const imperial = convertFormUnits(defaultFormState(), 'imperial')
    expect(imperial.units).toBe('imperial')
    expect(Number(imperial.t1)).toBeCloseTo(0.0787402, 6)
    expect(Number(imperial.d)).toBeCloseTo(0.19685, 5)
    expect(Number(imperial.E1)).toBeCloseTo(10_442_717, -2)
    expect(imperial.a).toBe('0.6667')
    expect(imperial.shear).toBe('single')
  })

  it('round-trips back to the original round values', () => {
    const state = defaultFormState()
    const back = convertFormUnits(convertFormUnits(state, 'imperial'), 'si')
    expect(back.t1).toBe('2')
    expect(back.t2).toBe('3')
    expect(back.d).toBe('5')
    expect(back.E1).toBe('72000')
    expect(back.Ef).toBe('110000')
  })

  it('round-trips imperial round values too', () => {
    const imperial = { ...defaultFormState(), units: 'imperial' as const, t1: '0.04', t2: '0.063', d: '0.1875', E1: '10500000', E2: '10500000', Ef: '16000000' }
    const back = convertFormUnits(convertFormUnits(imperial, 'si'), 'imperial')
    expect(back.t1).toBe('0.04')
    expect(back.d).toBe('0.1875')
    expect(back.E1).toBe('10500000')
  })

  it('leaves blank or malformed fields alone', () => {
    const converted = convertFormUnits({ ...defaultFormState(), t1: '', t2: 'abc' }, 'imperial')
    expect(converted.t1).toBe('')
    expect(converted.t2).toBe('abc')
  })

  it('is a no-op for the same unit system', () => {
    const state = defaultFormState()
    expect(convertFormUnits(state, 'si')).toBe(state)
  })
})

describe('formatInputValue', () => {
  it('trims trailing noise and returns an empty string for non-finite input', () => {
    expect(formatInputValue(0.07874015748)).toBe('0.0787402')
    expect(formatInputValue(72000)).toBe('72000')
    expect(formatInputValue(2.9999994)).toBe('3')
    expect(formatInputValue(0)).toBe('0')
    expect(formatInputValue(Number.NaN)).toBe('')
  })
})
