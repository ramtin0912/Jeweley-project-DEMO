/**
 * @file packages index
 * @description GET /api/admin/packages — all packages with items.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.package.findMany({
    include: { items: { include: { product: true, variant: true } } },
    orderBy: { createdAt: 'desc' }
  })
})
