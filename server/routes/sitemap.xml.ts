/**
 * @file sitemap
 * @description GET /sitemap.xml — XML sitemap of storefront routes.
 *
 * @status None
 * @issues None
 * @todo Add blog post URLs when the blog exists.
 */
import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const origin = getRequestURL(event).origin

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true }
  })

  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true }
  })

  const urls = [
    `${origin}/`,
    `${origin}/packages`,
    `${origin}/portfolio`,
    `${origin}/blog`,
    ...products.map((p) => `${origin}/products/${encodeURIComponent(p.slug)}`),
    ...posts.map((p) => `${origin}/blog/${encodeURIComponent(p.slug)}`)
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>'
  ].join('\n')

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
