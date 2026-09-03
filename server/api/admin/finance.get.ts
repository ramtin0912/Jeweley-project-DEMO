/**
 * @file finance
 * @description GET /api/admin/finance — finance-hub summary in one call:
 *   totals (today / this month / last month, avg order value, this-month sales count),
 *   a paginated month-by-month revenue trend (page 1 = most recent, prev/next for older
 *   months), and top products by revenue. All revenue is computed from paid orders
 *   (never stored). Months bucket by the Shamsi calendar.
 *
 *   Query: monthPage (1-indexed, default 1), monthPerPage (default 12, max 60).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import {
  aggregateIntoBuckets,
  aggregateProductRevenue,
  buildMonthRange,
  computeTotals
} from '~~/app/utils/finance'
import { toShamsiYearMonth } from '~~/app/utils/shamsiDate'

const DEFAULT_MONTH_PER_PAGE = 12
const MAX_MONTH_PER_PAGE = 60

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const monthPage = Math.max(1, Number(query.monthPage) || 1)
  const monthPerPage = Math.min(
    MAX_MONTH_PER_PAGE,
    Math.max(1, Number(query.monthPerPage) || DEFAULT_MONTH_PER_PAGE)
  )

  const allOrders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })

  const paidOrders = allOrders.filter((o) => o.paidAt !== null)
  const sales = paidOrders.map((o) => ({ paidAt: o.paidAt ?? o.createdAt, totalToman: o.totalToman }))
  const reference = new Date()

  const totals = computeTotals(sales, reference)
  const perProduct = aggregateProductRevenue(
    paidOrders.flatMap((o) =>
      o.items.map((item) => ({
        itemId: item.itemId,
        nameFa: item.nameFa,
        priceToman: item.priceToman,
        quantity: item.quantity
      }))
    )
  )

  // Full month-by-month history, oldest -> newest, then page from the most recent.
  const currentYM = toShamsiYearMonth(reference)
  let startYM = currentYM
  for (const sale of sales) {
    const ym = toShamsiYearMonth(sale.paidAt)
    if (ym.year < startYM.year || (ym.year === startYM.year && ym.month < startYM.month)) {
      startYM = ym
    }
  }
  const allBuckets = buildMonthRange(startYM, currentYM)
  aggregateIntoBuckets(allBuckets, sales)
  const monthTotal = allBuckets.length

  const startIdx = Math.max(0, monthTotal - monthPage * monthPerPage)
  const monthly = allBuckets.slice(startIdx, Math.max(startIdx, monthTotal - (monthPage - 1) * monthPerPage))

  return {
    totals,
    monthly,
    monthTotal,
    monthPage,
    monthPerPage,
    perProduct
  }
})
