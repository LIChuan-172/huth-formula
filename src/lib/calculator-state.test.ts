import { describe, expect, it } from 'vitest'
import { defaultFormState, parseForm } from './calculator-state'

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
