/**
 * @file categories create
 * @description POST /api/admin/categories — create a category.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { makeUniqueSlug, slugifyFa } from '~~/server/utils/slug'

const schema = z.object({
  nameFa: z.string().trim().min(1).max(100),
  slug: z.string().trim().max(100).optional(),
  sortOrder: z.number().int().min(0).default(0)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات دسته‌بندی نامعتبر است' })
  }
  const data = parsed.data
  const slug = data.slug?.trim() || await makeUniqueSlug(
    slugifyFa(data.nameFa),
    async (s) => !!(await prisma.category.findUnique({ where: { slug: s } }))
  )
  return prisma.category.create({ data: { nameFa: data.nameFa, slug, sortOrder: data.sortOrder } })
})
