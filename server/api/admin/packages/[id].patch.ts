/**
 * @file packages update
 * @description PATCH /api/admin/packages/:id — update a package and its items.
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
  nameFa: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().max(200).optional(),
  descriptionFa: z.string().trim().max(2000).nullable().optional(),
  priceToman: z.number().int().min(0).optional(),
  image: z.string().trim().max(500).nullable().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD_OUT', 'ARCHIVED']).optional(),
  stockCount: z.number().int().min(0).optional(),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) })).optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه نامعتبر است' })
  }

  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات پکیج نامعتبر است' })
  }
  const data = parsed.data

  let slug: string | undefined
  if (data.slug?.trim()) {
    slug = await makeUniqueSlug(data.slug.trim(), async (s) => {
      const existing = await prisma.package.findUnique({ where: { slug: s } })
      return !!existing && existing.id !== id
    })
  } else if (data.nameFa) {
    slug = await makeUniqueSlug(slugifyFa(data.nameFa), async (s) => {
      const existing = await prisma.package.findUnique({ where: { slug: s } })
      return !!existing && existing.id !== id
    })
  }

  return prisma.$transaction(async (tx) => {
    const pkg = await tx.package.update({
      where: { id },
      data: {
        ...(data.nameFa !== undefined && { nameFa: data.nameFa }),
        ...(slug !== undefined && { slug }),
        ...(data.descriptionFa !== undefined && { descriptionFa: data.descriptionFa }),
        ...(data.priceToman !== undefined && { priceToman: data.priceToman }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.stockCount !== undefined && { stockCount: data.stockCount }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription })
      }
    })

    if (data.items !== undefined) {
      await tx.packageItem.deleteMany({ where: { packageId: id } })
      if (data.items.length) {
        await tx.packageItem.createMany({
          data: data.items.map((i) => ({ packageId: id, productId: i.productId, quantity: i.quantity }))
        })
      }
    }

    return pkg
  })
})
