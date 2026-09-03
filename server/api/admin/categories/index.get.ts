/**
 * @file categories index
 * @description GET /api/admin/categories — all categories (admin).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
})
