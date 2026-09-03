/**
 * @file orders index
 * @description GET /api/admin/orders — order list with items plus an all-order status
 *   split. Query (optional): status, applied to the list only — the statusBreakdown always
 *   reflects the full catalogue so the summary cards never shrink when a filter is active.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { computeStatusBreakdown } from '~~/app/utils/orderStatus'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const status = typeof query.status === 'string' ? query.status : undefined

  const [statusRows, orders] = await Promise.all([
    prisma.order.findMany({ select: { status: true, totalToman: true } }),
    prisma.order.findMany({
      where: status ? { status: status as 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED' } : {},
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  ])

  return {
    orders,
    statusBreakdown: computeStatusBreakdown(statusRows)
  }
})
