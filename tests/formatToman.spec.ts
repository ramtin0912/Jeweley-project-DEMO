import { describe, it, expect } from 'vitest'
import { formatToman, toPersianDigits } from '../app/utils/formatToman'

describe('formatToman', () => {
  it('formats thousands with Persian separator and digits', () => {
    expect(formatToman(12500)).toBe('۱۲٬۵۰۰ تومان')
  })

  it('formats zero', () => {
    expect(formatToman(0)).toBe('۰ تومان')
  })

  it('formats a single digit', () => {
    expect(formatToman(5)).toBe('۵ تومان')
  })
})

describe('toPersianDigits', () => {
  it('converts latin digits to Persian digits', () => {
    expect(toPersianDigits('123')).toBe('۱۲۳')
  })

  it('leaves non-digit characters intact', () => {
    expect(toPersianDigits('a1b2')).toBe('a۱b۲')
  })
})
