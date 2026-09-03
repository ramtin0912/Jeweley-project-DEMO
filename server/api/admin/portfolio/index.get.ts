/**
 * @file portfolio index
 * @description GET /api/admin/portfolio — all portfolio works.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.portfolioWork.findMany({ orderBy: { createdAt: 'desc' } })
})
