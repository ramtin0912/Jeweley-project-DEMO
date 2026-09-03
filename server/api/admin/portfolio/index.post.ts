/**
 * @file portfolio create
 * @description POST /api/admin/portfolio — create a portfolio work.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

const schema = z.object({
  titleFa: z.string().trim().min(1).max(200),
  descriptionFa: z.string().trim().max(2000).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  material: z.string().trim().max(200).nullable().optional(),
  year: z.number().int().min(1300).max(1500).nullable().optional(),
  isFeatured: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات نمونه‌کار نامعتبر است' })
  }
  const data = parsed.data
  return prisma.portfolioWork.create({
    data: {
      titleFa: data.titleFa,
      descriptionFa: data.descriptionFa ?? null,
      image: data.image ?? null,
      material: data.material ?? null,
      year: data.year ?? null,
      isFeatured: data.isFeatured
    }
  })
})
