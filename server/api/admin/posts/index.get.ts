/**
 * @file posts index
 * @description GET /api/admin/posts — all blog posts (published and drafts).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return prisma.post.findMany({ orderBy: { updatedAt: 'desc' } })
})
