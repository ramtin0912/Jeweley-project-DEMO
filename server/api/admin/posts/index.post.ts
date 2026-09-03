/**
 * @file posts create
 * @description POST /api/admin/posts — create a blog post.
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
  titleFa: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(200).optional(),
  contentMd: z.string().min(1),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDescription: z.string().trim().max(500).nullable().optional(),
  published: z.boolean().default(false)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات مقاله نامعتبر است' })
  }
  const data = parsed.data

  const slug = data.slug?.trim() || await makeUniqueSlug(
    slugifyFa(data.titleFa),
    async (s) => !!(await prisma.post.findUnique({ where: { slug: s } }))
  )

  return prisma.post.create({
    data: {
      titleFa: data.titleFa,
      slug,
      contentMd: data.contentMd,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      published: data.published,
      publishedAt: data.published ? new Date() : null
    }
  })
})
