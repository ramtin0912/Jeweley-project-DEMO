/**
 * @file packages create
 * @description POST /api/admin/packages — create a package with items.
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
  nameFa: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  descriptionFa: z.string().trim().max(2000).nullable().optional(),
  priceToman: z.number().int().min(0),
  image: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'ARCHIVED']).default('ACTIVE'),
  stockCount: z.number().int().min(0).default(0),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات پکیج نامعتبر است' })
  }
  const data = parsed.data

  const slug = data.slug?.trim() || await makeUniqueSlug(
    slugifyFa(data.nameFa),
    async (s) => !!(await prisma.package.findUnique({ where: { slug: s } }))
  )

  return prisma.package.create({
    data: {
      nameFa: data.nameFa,
      slug,
      descriptionFa: data.descriptionFa ?? null,
      priceToman: data.priceToman,
      image: data.image ?? null,
      status: data.status,
      stockCount: data.stockCount,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      ...(data.items?.length
        ? { items: { create: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) } }
        : {})
    }
  })
})
