/**
 * @file packages index
 * @description GET /api/packages — active packages with their items.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(() => {
  return prisma.package.findMany({
    where: { status: 'ACTIVE' },
    include: { items: { include: { product: true, variant: true } } },
    orderBy: { createdAt: 'desc' }
  })
})
