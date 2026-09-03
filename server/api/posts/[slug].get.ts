/**
 * @file posts slug
 * @description GET /api/posts/:slug — a published post rendered to HTML.
 *
 * @status None
 * @issues None
 * @todo None
 */
import MarkdownIt from 'markdown-it'
import { prisma } from '~~/server/utils/prisma'

const md = new MarkdownIt({ html: false, linkify: true })

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post || !post.published) {
    throw createError({ statusCode: 404, statusMessage: 'پست یافت نشد' })
  }

  return {
    id: post.id,
    titleFa: post.titleFa,
    slug: post.slug,
    contentHtml: md.render(post.contentMd),
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    publishedAt: post.publishedAt
  }
})
