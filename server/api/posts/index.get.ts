/**
 * @file posts index
 * @description GET /api/posts — published blog posts.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(() => {
  return prisma.post.findMany({
    where: { published: true },
    select: { id: true, titleFa: true, slug: true, seoDescription: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' }
  })
})
