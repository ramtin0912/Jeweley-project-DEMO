// story: e03s01

/**
 * @file shamsiDate.spec
 * @description Shamsi calendar math: year/month bucket and day-key helpers use the
 *   Asia/Tehran business timezone so revenue can bucket by Persian month.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { describe, it, expect } from 'vitest'
import { shamsiMonthName, toShamsiDayKey, toShamsiYearMonth } from '../app/utils/shamsiDate'

describe('toShamsiYearMonth', () => {
  it('maps a Gregorian date into Shamsi year/month (Asia/Tehran)', () => {
    expect(toShamsiYearMonth(new Date('2025-04-20T12:00:00Z'))).toEqual({ year: 1404, month: 1 })
  })

  it('maps late-Gregorian-March into the prior Shamsi year (Esfand)', () => {
    expect(toShamsiYearMonth(new Date('2025-03-20T12:00:00Z'))).toEqual({ year: 1403, month: 12 })
  })
})

describe('toShamsiDayKey', () => {
  it('returns a zero-padded YYYY-MM-DD Shamsi key', () => {
    expect(toShamsiDayKey(new Date('2025-04-20T12:00:00Z'))).toBe('1404-01-31')
  })
})

describe('shamsiMonthName', () => {
  it('returns Persian month names for 1..12', () => {
    expect(shamsiMonthName(1)).toBe('فروردین')
    expect(shamsiMonthName(12)).toBe('اسفند')
  })

  it('returns an empty string for out-of-range months', () => {
    expect(shamsiMonthName(0)).toBe('')
    expect(shamsiMonthName(13)).toBe('')
  })
})
