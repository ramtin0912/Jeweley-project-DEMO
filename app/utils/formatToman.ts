/**
 * @file formatToman
 * @description Persian Toman price formatting: thousands separators + Persian digits.
 *
 * @status None
 * @issues None
 * @todo None
 */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)] ?? digit)
}

export function formatToman(priceToman: number): string {
  const grouped = priceToman.toLocaleString('en-US').replace(/,/g, '٬')
  return `${toPersianDigits(grouped)} تومان`
}
