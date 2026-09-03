/**
 * @file products index
 * @description GET /api/products — active products with category and variants.
 *   Query: category (slug), q (name/description search), inStock (true).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { Prisma } from '~/generated/prisma/client'
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : undefined
  const q = typeof query.q === 'string' ? query.q.trim() : undefined
  const inStock = query.inStock === 'true'

  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' }
  if (category) {
    where.category = { slug: category }
  }
  if (q) {
    where.OR = [{ nameFa: { contains: q } }, { descriptionFa: { contains: q } }]
  }
  if (inStock) {
    where.stockCount = { gt: 0 }
  }

  return prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: 'desc' }
  })
})
