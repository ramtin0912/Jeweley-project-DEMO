/**
 * @file portfolio update
 * @description PATCH /api/admin/portfolio/:id — update a portfolio work.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

const schema = z.object({
  titleFa: z.string().trim().min(1).max(200).optional(),
  descriptionFa: z.string().trim().max(2000).nullable().optional(),
  image: z.string().trim().max(500).nullable().optional(),
  material: z.string().trim().max(200).nullable().optional(),
  year: z.number().int().min(1300).max(1500).nullable().optional(),
  isFeatured: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه نامعتبر است' })
  }
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات نمونه‌کار نامعتبر است' })
  }
  const data = parsed.data
  return prisma.portfolioWork.update({
    where: { id },
    data: {
      ...(data.titleFa !== undefined && { titleFa: data.titleFa }),
      ...(data.descriptionFa !== undefined && { descriptionFa: data.descriptionFa }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.material !== undefined && { material: data.material }),
      ...(data.year !== undefined && { year: data.year }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured })
    }
  })
})
