/**
 * @file finance
 * @description Pure revenue-math helpers for the admin finance hub and dashboard.
 *   All money is Toman integers and all figures are derived from paid orders
 *   (never stored). Months bucket by the Shamsi calendar in the Asia/Tehran
 *   business timezone.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { shamsiMonthName, toShamsiDayKey, toShamsiYearMonth } from './shamsiDate'

// story: e03s01

export interface PaidSale {
  paidAt: string | Date
  totalToman: number
}

export interface MonthBucket {
  year: number
  month: number
  label: string
  revenue: number
  orderCount: number
}

export interface FinanceTotals {
  totalRevenue: number
  orderCount: number
  thisMonthRevenue: number
  thisMonthOrderCount: number
  lastMonthRevenue: number
  todayRevenue: number
  avgOrderValue: number
}

export interface ProductRevenue {
  nameFa: string
  quantity: number
  revenue: number
}

export interface SaleItem {
  itemId: number
  nameFa: string
  priceToman: number
  quantity: number
}

export function lastShamsiYearMonth(reference: Date): { year: number; month: number } {
  const current = toShamsiYearMonth(reference)
  if (current.month === 1) return { year: current.year - 1, month: 12 }
  return { year: current.year, month: current.month - 1 }
}

export function buildMonthRange(
  start: { year: number; month: number },
  end: { year: number; month: number }
): MonthBucket[] {
  const buckets: MonthBucket[] = []
  let year = start.year
  let month = start.month
  while (year < end.year || (year === end.year && month <= end.month)) {
    buckets.push({ year, month, label: shamsiMonthName(month), revenue: 0, orderCount: 0 })
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
  }
  return buckets
}

export function aggregateIntoBuckets(buckets: MonthBucket[], sales: PaidSale[]): void {
  for (const sale of sales) {
    const { year, month } = toShamsiYearMonth(sale.paidAt)
    const bucket = buckets.find((b) => b.year === year && b.month === month)
    if (!bucket) continue
    bucket.revenue += sale.totalToman
    bucket.orderCount += 1
  }
}

export function computeTotals(sales: PaidSale[], reference: Date): FinanceTotals {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalToman, 0)
  const orderCount = sales.length
  const current = toShamsiYearMonth(reference)
  const last = lastShamsiYearMonth(reference)
  const todayKey = toShamsiDayKey(reference)

  let thisMonthRevenue = 0
  let thisMonthOrderCount = 0
  let lastMonthRevenue = 0
  let todayRevenue = 0
  for (const sale of sales) {
    const { year, month } = toShamsiYearMonth(sale.paidAt)
    if (year === current.year && month === current.month) {
      thisMonthRevenue += sale.totalToman
      thisMonthOrderCount += 1
    }
    if (year === last.year && month === last.month) lastMonthRevenue += sale.totalToman
    if (toShamsiDayKey(sale.paidAt) === todayKey) todayRevenue += sale.totalToman
  }

  return {
    totalRevenue,
    orderCount,
    thisMonthRevenue,
    thisMonthOrderCount,
    lastMonthRevenue,
    todayRevenue,
    avgOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0
  }
}

export function aggregateProductRevenue(items: SaleItem[]): ProductRevenue[] {
  const byItem = new Map<number, ProductRevenue>()
  for (const item of items) {
    const revenue = item.priceToman * item.quantity
    const existing = byItem.get(item.itemId)
    if (existing) {
      existing.quantity += item.quantity
      existing.revenue += revenue
    } else {
      byItem.set(item.itemId, { nameFa: item.nameFa, quantity: item.quantity, revenue })
    }
  }
  return [...byItem.values()].sort((a, b) => b.revenue - a.revenue)
}
