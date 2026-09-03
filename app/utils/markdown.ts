/**
 * @file markdown
 * @description Tiny markdown→HTML renderer used by the client-side sandbox so posts
 *   created/edited in the static demo admin are rendered on the storefront blog.
 *   Mirrors the server-side renderer in `server/utils`/`staticCatalog`.
 *
 * @status None
 * @issues None
 * @todo None
 */
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })

export function renderMarkdown(content: string): string {
  if (!content) return ''
  return md.render(content)
}
