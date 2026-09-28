import { describe, expect, it } from 'vitest'
import {
  JOINT_PRESETS,
  computeHuth,
  getJointPreset,
  huthCompliance,
  huthStiffness,
  isValidHuthInput,
  shearPlanes,
  validateHuthInput,
  type HuthInput,
} from './huth'

const boltedMetallic = getJointPreset('bolted-metallic')

/** 2 mm and 3 mm aluminium sheets, 5 mm titanium bolt, single shear. */
const siExample: HuthInput = {
  t1: 2,
  t2: 3,
  d: 5,
  E1: 72_000,
  E2: 72_000,
  Ef: 110_000,
  shear: 'single',
  a: boltedMetallic.a,
  b: boltedMetallic.b,
}

describe('joint presets', () => {
  it('match the Huth (1986) constants', () => {
    expect(getJointPreset('bolted-metallic')).toMatchObject({ a: 2 / 3, b: 3.0 })
    expect(getJointPreset('riveted-metallic')).toMatchObject({ a: 2 / 5, b: 2.2 })
    expect(getJointPreset('bolted-composite')).toMatchObject({ a: 2 / 3, b: 4.2 })
    expect(JOINT_PRESETS).toHaveLength(3)
  })

  it('maps shear type to the number of shear planes', () => {
    expect(shearPlanes('single')).toBe(1)
    expect(shearPlanes('double')).toBe(2)
  })
})

describe('computeHuth – worked example (SI, single shear, bolted metallic)', () => {
  // Hand calculation:
  //   geometry factor = ((2 + 3) / (2 · 5))^(2/3) = 0.5^(2/3)           = 0.629961
  //   b / n           = 3.0 / 1                                          = 3
  //   1/(t1 E1)       = 1 / (2 · 72000)                                  = 6.9444e-6
  //   1/(n t2 E2)     = 1 / (1 · 3 · 72000)                              = 4.6296e-6
  //   1/(2 t1 Ef)     = 1 / (2 · 2 · 110000)                             = 2.2727e-6
  //   1/(2 n t2 Ef)   = 1 / (2 · 1 · 3 · 110000)                         = 1.5152e-6
  //   bracket sum                                                        = 1.53620e-5 mm/N
  //   C = 0.629961 · 3 · 1.53620e-5                                      = 2.90323e-5 mm/N
  //   k = 1 / C                                                          = 34 444 N/mm
  const result = computeHuth(siExample)

  it('computes the intermediate factors', () => {
    expect(result.n).toBe(1)
    expect(result.geometryFactor).toBeCloseTo(0.629961, 6)
    expect(result.jointFactor).toBe(3)
    expect(result.terms.plate1Bearing).toBeCloseTo(6.9444e-6, 10)
    expect(result.terms.plate2Bearing).toBeCloseTo(4.6296e-6, 10)
    expect(result.terms.fastenerAtPlate1).toBeCloseTo(2.2727e-6, 10)
    expect(result.terms.fastenerAtPlate2).toBeCloseTo(1.5152e-6, 10)
    expect(result.bracketSum).toBeCloseTo(1.5362e-5, 9)
  })

  it('computes compliance and stiffness', () => {
    expect(result.compliance).toBeCloseTo(2.90323e-5, 10)
    expect(result.stiffness).toBeCloseTo(34_444.4, 1)
    expect(result.stiffness * result.compliance).toBeCloseTo(1, 12)
  })

  it('exposes convenience wrappers', () => {
    expect(huthCompliance(siExample)).toBe(result.compliance)
    expect(huthStiffness(siExample)).toBe(result.stiffness)
  })
})

describe('computeHuth – worked example (imperial, double shear, bolted metallic)', () => {
  // 0.040 in outer plates, 0.063 in middle plate, 3/16 in bolt,
  // aluminium plates (10.5 Msi) and steel fastener (16 Msi).
  //   geometry factor = ((0.040 + 0.063) / (2 · 0.1875))^(2/3)         = 0.422543
  //   b / n           = 3.0 / 2                                          = 1.5
  //   bracket sum     = 1/(0.040·10.5e6) + 1/(2·0.063·10.5e6)
  //                   + 1/(2·0.040·16e6) + 1/(2·2·0.063·16e6)          = 4.16608e-6 in/lbf
  //   C               = 0.422543 · 1.5 · 4.16608e-6                     = 2.64052e-6 in/lbf
  //   k               = 1 / C                                           = 378 714 lbf/in
  const result = computeHuth({
    t1: 0.04,
    t2: 0.063,
    d: 0.1875,
    E1: 10.5e6,
    E2: 10.5e6,
    Ef: 16e6,
    shear: 'double',
    a: 2 / 3,
    b: 3.0,
  })

  it('computes compliance and stiffness', () => {
    expect(result.n).toBe(2)
    expect(result.geometryFactor).toBeCloseTo(0.422543, 6)
    expect(result.jointFactor).toBe(1.5)
    expect(result.bracketSum).toBeCloseTo(4.16608e-6, 11)
    expect(result.compliance).toBeCloseTo(2.64052e-6, 11)
    expect(result.stiffness).toBeCloseTo(378_714, 0)
  })
})

describe('computeHuth – behaviour', () => {
  it('is symmetric in the plate labels for single shear', () => {
    const swapped: HuthInput = { ...siExample, t1: siExample.t2, t2: siExample.t1, E1: 90_000, E2: 72_000 }
    const original: HuthInput = { ...siExample, E1: 72_000, E2: 90_000 }
    expect(computeHuth(swapped).compliance).toBeCloseTo(computeHuth(original).compliance, 15)
  })

  it('is stiffer in double shear than in single shear', () => {
    const single = computeHuth({ ...siExample, shear: 'single' })
    const double = computeHuth({ ...siExample, shear: 'double' })
    expect(double.stiffness).toBeGreaterThan(single.stiffness)
  })

  it('scales linearly with b', () => {
    const base = computeHuth(siExample)
    const composite = computeHuth({ ...siExample, b: 4.2 })
    expect(composite.compliance / base.compliance).toBeCloseTo(4.2 / 3.0, 12)
  })

  it('reduces to the bracket sum times b/n when (t1 + t2) equals 2d', () => {
    const result = computeHuth({ ...siExample, t1: 4, t2: 6, d: 5 })
    expect(result.geometryFactor).toBeCloseTo(1, 12)
    expect(result.compliance).toBeCloseTo(result.jointFactor * result.bracketSum, 15)
  })

  it('accepts a = 0 (no geometry correction)', () => {
    const result = computeHuth({ ...siExample, a: 0 })
    expect(result.geometryFactor).toBe(1)
  })
})

describe('validateHuthInput', () => {
  it('accepts the worked example', () => {
    expect(validateHuthInput(siExample)).toEqual({})
    expect(isValidHuthInput(siExample)).toBe(true)
  })

  it('rejects zero, negative and non-numeric values', () => {
    const errors = validateHuthInput({ ...siExample, t1: 0, d: -1, Ef: Number.NaN, b: 0, a: -0.5 })
    expect(Object.keys(errors).sort()).toEqual(['Ef', 'a', 'b', 'd', 't1'])
    expect(errors.t1).toMatch(/greater than zero/)
    expect(errors.Ef).toMatch(/must be a number/)
    expect(errors.a).toMatch(/negative/)
  })

  it('makes computeHuth throw on invalid input', () => {
    expect(() => computeHuth({ ...siExample, d: 0 })).toThrow(RangeError)
  })
})
