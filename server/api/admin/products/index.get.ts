/**
 * @file products index
 * @description GET /api/admin/products — all products (any status) with category.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: 'desc' }
  })
})
