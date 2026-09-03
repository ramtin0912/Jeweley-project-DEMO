// story: e03s01

/**
 * @file revenue.spec
 * @description Pure revenue aggregation: totals (today / this / last month), Shamsi
 *   month buckets + trend, top-product revenue, and the prior-month helper.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { describe, it, expect } from 'vitest'
import {
  aggregateIntoBuckets,
  aggregateProductRevenue,
  buildMonthRange,
  computeTotals,
  lastShamsiYearMonth
} from '../app/utils/finance'

const sales = [
  { paidAt: '2025-04-10T10:00:00Z', totalToman: 100_000 }, // 1404/1 (this month)
  { paidAt: '2025-03-10T10:00:00Z', totalToman: 200_000 }, // 1403/12 (last month)
  { paidAt: '2025-04-30T10:00:00Z', totalToman: 300_000 }, // 1404/2 (next month)
  { paidAt: '2025-04-20T08:00:00Z', totalToman: 50_000 } // 1404/1 (today)
]
const reference = new Date('2025-04-20T12:00:00Z')

describe('computeTotals', () => {
  it('sums revenue by today / this month / last month / all-time', () => {
    const totals = computeTotals(sales, reference)
    expect(totals).toEqual({
      totalRevenue: 650_000,
      orderCount: 4,
      thisMonthRevenue: 150_000,
      thisMonthOrderCount: 2,
      lastMonthRevenue: 200_000,
      todayRevenue: 50_000,
      avgOrderValue: 162_500
    })
  })
})

describe('lastShamsiYearMonth', () => {
  it('wraps from month 1 back to month 12 of the prior Shamsi year', () => {
    expect(lastShamsiYearMonth(reference)).toEqual({ year: 1403, month: 12 })
  })

  it('steps back one month inside a year', () => {
    expect(lastShamsiYearMonth(new Date('2025-05-10T12:00:00Z'))).toEqual({ year: 1404, month: 1 })
  })
})

describe('buildMonthRange', () => {
  it('builds ascending month buckets from start to end inclusive, wrapping the year', () => {
    const buckets = buildMonthRange({ year: 1403, month: 11 }, { year: 1404, month: 1 })
    expect(buckets.map((b) => `${b.year}/${b.month}`)).toEqual(['1403/11', '1403/12', '1404/1'])
    expect(buckets[0]).toMatchObject({ label: 'بهمن' })
    expect(buckets[2]).toMatchObject({ label: 'فروردین' })
  })

  it('returns a single bucket when start equals end', () => {
    const buckets = buildMonthRange({ year: 1404, month: 1 }, { year: 1404, month: 1 })
    expect(buckets).toHaveLength(1)
  })
})

describe('aggregateIntoBuckets', () => {
  it('fills revenue and order count into matching Shamsi month buckets', () => {
    const buckets = buildMonthRange({ year: 1403, month: 12 }, { year: 1404, month: 2 })
    aggregateIntoBuckets(buckets, sales)
    expect(buckets.map((b) => [b.year, b.month, b.revenue, b.orderCount])).toEqual([
      [1403, 12, 200_000, 1],
      [1404, 1, 150_000, 2],
      [1404, 2, 300_000, 1]
    ])
  })
})

describe('aggregateProductRevenue', () => {
  it('groups by item and sorts by revenue descending', () => {
    const items = [
      { itemId: 1, nameFa: 'گردنبند نقره', priceToman: 100_000, quantity: 2 },
      { itemId: 1, nameFa: 'گردنبند نقره', priceToman: 100_000, quantity: 1 },
      { itemId: 2, nameFa: 'النگوی نقره', priceToman: 50_000, quantity: 1 }
    ]
    expect(aggregateProductRevenue(items)).toEqual([
      { nameFa: 'گردنبند نقره', quantity: 3, revenue: 300_000 },
      { nameFa: 'النگوی نقره', quantity: 1, revenue: 50_000 }
    ])
  })
})
