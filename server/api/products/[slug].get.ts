/**
 * @file products slug
 * @description GET /api/products/:slug — one active product with category and variants.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, variants: true }
  })

  if (!product || product.status !== 'ACTIVE') {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return product
})
