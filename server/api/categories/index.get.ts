/**
 * @file categories index
 * @description GET /api/categories — active categories with product counts.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(() => {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } }
  })
})
