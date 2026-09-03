/**
 * @file shamsiDate
 * @description Shamsi (Persian) date formatting and calendar math via Intl.DateTimeFormat.
 *   All month/day buckets use the business timezone for a Persian store (Asia/Tehran).
 *
 * @status None
 * @issues None
 * @todo None
 */

// story: e03s01

const PERSIAN_TZ = 'Asia/Tehran'

// Persian (۰-۹) and Arabic-Indic (٠-٩) digits, for Intl numeric parts that come back
// in non-Latin digits. Number('۱۴۰۴') is NaN, so parse through this map first.
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'

function toLatinDigits(value: string): string {
  return value
    .split('')
    .map((char) => {
      const fa = FA_DIGITS.indexOf(char)
      if (fa >= 0) return String(fa)
      const ar = AR_DIGITS.indexOf(char)
      if (ar >= 0) return String(ar)
      return char
    })
    .join('')
}

export function toShamsiDate(value: Date | string | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  } catch {
    return date.toLocaleDateString('fa-IR')
  }
}

interface ShamsiParts {
  year: number
  month: number
  day: number
}

function shamsiParts(value: Date | string): ShamsiParts {
  const date = typeof value === 'string' ? new Date(value) : value
  const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: PERSIAN_TZ
  }).formatToParts(date)

  let year = 0
  let month = 0
  let day = 0
  for (const part of parts) {
    if (part.type === 'year') year = Number(toLatinDigits(part.value))
    if (part.type === 'month') month = Number(toLatinDigits(part.value))
    if (part.type === 'day') day = Number(toLatinDigits(part.value))
  }
  return { year, month, day }
}

export function toShamsiYearMonth(value: Date | string): { year: number; month: number } {
  const { year, month } = shamsiParts(value)
  return { year, month }
}

export function toShamsiDayKey(value: Date | string): string {
  const { year, month, day } = shamsiParts(value)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const SHAMSI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
]

export function shamsiMonthName(month: number): string {
  return SHAMSI_MONTHS[month - 1] ?? ''
}
