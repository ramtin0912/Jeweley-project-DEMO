/**
 * @file useAdminDerived
 * @description Derives the admin dashboard, finance, and order-status metrics client-side
 *   from the visitor's sandboxed orders. Mirrors the logic of the server "earnings",
 *   "finance", and "orders" handlers so the read-only admin data stays consistent when a
 *   visitor edits orders in their own browser.
 *
 * @status Client-only derived data for the static demo sandbox.
 * @issues None
 * @todo None
 */
import {
  aggregateIntoBuckets,
  aggregateProductRevenue,
  buildMonthRange,
  computeTotals
} from '~/utils/finance'
import type { PaidSale, SaleItem } from '~/utils/finance'
import { computeStatusBreakdown } from '~/utils/orderStatus'
import { toShamsiYearMonth } from '~/utils/shamsiDate'

export function useAdminDerived() {
  const { data, updateOrderStatus } = useShopData()
  const orders = computed(() => data.value.orders)
  const products = computed(() => data.value.products)

  function paidSales(): PaidSale[] {
    return orders.value
      .filter((o) => o.paidAt !== null)
      .map((o) => ({ paidAt: o.paidAt ?? o.createdAt, totalToman: o.totalToman }))
  }

  function paidItems(): SaleItem[] {
    return orders.value
      .filter((o) => o.paidAt !== null)
      .flatMap((o) =>
        o.items.map((it) => ({
          itemId: it.id,
          nameFa: it.nameFa,
          priceToman: it.priceToman,
          quantity: it.quantity
        }))
      )
  }

  const statusBreakdown = computed(() =>
    computeStatusBreakdown(
      orders.value.map((o) => ({ status: o.status, totalToman: o.totalToman }))
    )
  )

  const earnings = computed(() => {
    const totals = computeTotals(paidSales(), new Date())
    return {
      totalRevenue: totals.totalRevenue,
      orderCount: totals.orderCount,
      thisMonthRevenue: totals.thisMonthRevenue,
      thisMonthOrderCount: totals.thisMonthOrderCount,
      lastMonthRevenue: totals.lastMonthRevenue,
      todayRevenue: totals.todayRevenue,
      perProduct: aggregateProductRevenue(paidItems()),
      recentOrders: orders.value.slice(0, 10).map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        totalToman: o.totalToman,
        status: o.status,
        createdAt: o.createdAt,
        paidAt: o.paidAt,
        itemCount: o.items.length
      }))
    }
  })

  function finance(monthPage = 1, monthPerPage = 12) {
    const sales = paidSales()
    const totals = computeTotals(sales, new Date())
    const reference = new Date()
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
    const monthly = allBuckets.slice(
      startIdx,
      Math.max(startIdx, monthTotal - (monthPage - 1) * monthPerPage)
    )
    return {
      totals,
      monthly,
      monthTotal,
      monthPage,
      monthPerPage,
      perProduct: aggregateProductRevenue(paidItems())
    }
  }

  return { orders, products, statusBreakdown, earnings, finance, updateOrderStatus }
}
