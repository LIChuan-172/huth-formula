import type { HuthField } from '@/lib/huth'
import type { Messages } from '@/lib/messages'

/**
 * Maps the English validation sentences produced by the calculation core onto
 * the active language. The core strings stay stable so the formula tests do
 * not depend on the interface language.
 */
export function localizeFieldError(field: HuthField, message: string, m: Messages): string {
  const label = m.fields[field]
  if (message.endsWith(' is required.')) return m.errors.required(label)
  if (message.endsWith(' must be a number.')) return m.errors.number(label)
  if (message.endsWith(' must be greater than zero.')) return m.errors.positive(label)
  if (message.endsWith(' must not be negative.')) return m.errors.nonNegative(label)
  return message
}
