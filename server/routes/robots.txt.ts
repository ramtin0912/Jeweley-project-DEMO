/**
 * @file robots
 * @description GET /robots.txt — crawler directives + sitemap location.
 *
 * @status None
 * @issues None
 * @todo None
 */
export default defineEventHandler((event) => {
  const origin = getRequestURL(event).origin
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /order',
    '',
    `Sitemap: ${origin}/sitemap.xml`
  ].join('\n')

  setHeader(event, 'Content-Type', 'text/plain')
  return body
})
