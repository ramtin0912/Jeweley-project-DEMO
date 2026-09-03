/**
 * @file portfolio index
 * @description GET /api/portfolio — past works, display only.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(() => {
  return prisma.portfolioWork.findMany({ orderBy: { createdAt: 'desc' } })
})
