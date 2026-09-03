/**
 * @file earnings
 * @description GET /api/admin/earnings — paid-order revenue summary for the dashboard.
 *   Includes all-time + this/last-month + today revenue and the latest orders (any
 *   status) so recent purchases can show their purchase status.
 *
 * @status None
 * @issues None
 * @todo Add date-range filter when needed.
 */
// story: e03s01

import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { aggregateProductRevenue, computeTotals } from '~~/app/utils/finance'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const paidOrders = await prisma.order.findMany({
    where: { paidAt: { not: null } },
    include: { items: true },
    orderBy: { paidAt: 'desc' }
  })

  const sales = paidOrders.map((o) => ({ paidAt: o.paidAt ?? o.createdAt, totalToman: o.totalToman }))
  const totals = computeTotals(sales, new Date())

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

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { items: true }
  })

  return {
    totalRevenue: totals.totalRevenue,
    orderCount: totals.orderCount,
    thisMonthRevenue: totals.thisMonthRevenue,
    thisMonthOrderCount: totals.thisMonthOrderCount,
    lastMonthRevenue: totals.lastMonthRevenue,
    todayRevenue: totals.todayRevenue,
    perProduct,
    recentOrders: recentOrders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalToman: o.totalToman,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt ? o.paidAt.toISOString() : null,
      itemCount: o.items.length
    }))
  }
})
