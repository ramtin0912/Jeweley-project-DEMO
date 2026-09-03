/**
 * @file posts update
 * @description PATCH /api/admin/posts/:id — update a blog post.
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
  titleFa: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().max(200).optional(),
  contentMd: z.string().min(1).optional(),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  published: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه نامعتبر است' })
  }

  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات مقاله نامعتبر است' })
  }
  const data = parsed.data

  const existing = await prisma.post.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'مقاله یافت نشد' })
  }

  let slug: string | undefined
  if (data.slug?.trim()) {
    slug = await makeUniqueSlug(data.slug.trim(), async (s) => {
      const found = await prisma.post.findUnique({ where: { slug: s } })
      return !!found && found.id !== id
    })
  } else if (data.titleFa) {
    slug = await makeUniqueSlug(slugifyFa(data.titleFa), async (s) => {
      const found = await prisma.post.findUnique({ where: { slug: s } })
      return !!found && found.id !== id
    })
  }

  return prisma.post.update({
    where: { id },
    data: {
      ...(data.titleFa !== undefined && { titleFa: data.titleFa }),
      ...(slug !== undefined && { slug }),
      ...(data.contentMd !== undefined && { contentMd: data.contentMd }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      ...(data.published !== undefined && {
        published: data.published,
        publishedAt: data.published ? (existing.publishedAt ?? new Date()) : null
      })
    }
  })
})
