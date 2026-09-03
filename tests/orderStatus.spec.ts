// story: e03s02

/**
 * @file orderStatus.spec
 * @description Status split aggregation used by the orders page: counts + revenue per
 *   status, always in canonical ORDER_STATUS_ORDER, with zero-fill for missing statuses.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { describe, it, expect } from 'vitest'
import { computeStatusBreakdown } from '../app/utils/orderStatus'

describe('computeStatusBreakdown', () => {
  it('aggregates count and revenue per status in canonical order', () => {
    const rows = computeStatusBreakdown([
      { status: 'PAID', totalToman: 500_000 },
      { status: 'PAID', totalToman: 700_000 },
      { status: 'PENDING', totalToman: 300_000 },
      { status: 'DELIVERED', totalToman: 1_200_000 }
    ])

    expect(rows.map((r) => r.status)).toEqual(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'])
    expect(rows.find((r) => r.status === 'PAID')).toMatchObject({ count: 2, revenue: 1_200_000 })
    expect(rows.find((r) => r.status === 'PENDING')).toMatchObject({ count: 1, revenue: 300_000 })
    expect(rows.find((r) => r.status === 'DELIVERED')).toMatchObject({ count: 1, revenue: 1_200_000 })
  })

  it('zero-fills statuses that appear in no order', () => {
    const rows = computeStatusBreakdown([{ status: 'PAID', totalToman: 100_000 }])

    expect(rows.find((r) => r.status === 'SHIPPED')).toMatchObject({ count: 0, revenue: 0 })
    expect(rows.find((r) => r.status === 'CANCELED')).toMatchObject({ count: 0, revenue: 0 })
  })

  it('carries a Persian label on every row', () => {
    const rows = computeStatusBreakdown([{ status: 'SHIPPED', totalToman: 1_000 }])

    expect(rows.find((r) => r.status === 'SHIPPED')?.label).toBe('ارسال شده')
  })

  it('returns an all-zero canonical spread for an empty input', () => {
    const rows = computeStatusBreakdown([])

    expect(rows).toHaveLength(5)
    expect(rows.every((r) => r.count === 0 && r.revenue === 0)).toBe(true)
  })
})
