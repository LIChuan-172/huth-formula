import { describe, expect, it } from 'vitest'
import { MESSAGES } from '@/lib/messages'
import { localizeFieldError } from '@/lib/localize-error'

describe('localizeFieldError', () => {
  it('keeps the English sentences used by the calculation core', () => {
    const m = MESSAGES.en
    expect(localizeFieldError('t1', 'Plate 1 thickness is required.', m)).toBe('Plate 1 thickness is required.')
    expect(localizeFieldError('d', 'Fastener diameter must be a number.', m)).toBe('Fastener diameter must be a number.')
    expect(localizeFieldError('b', 'Coefficient b must be greater than zero.', m)).toBe(
      'Coefficient b must be greater than zero.',
    )
    expect(localizeFieldError('a', 'Exponent a must not be negative.', m)).toBe('Exponent a must not be negative.')
  })

  it('translates the same sentences into Chinese', () => {
    const m = MESSAGES.zh
    expect(localizeFieldError('t1', 'Plate 1 thickness is required.', m)).toBe('板 1 厚度为必填项。')
    expect(localizeFieldError('d', 'Fastener diameter must be a number.', m)).toBe('紧固件直径必须是数字。')
    expect(localizeFieldError('b', 'Coefficient b must be greater than zero.', m)).toBe('系数 b 必须大于零。')
    expect(localizeFieldError('a', 'Exponent a must not be negative.', m)).toBe('指数 a 不能为负。')
  })
})
