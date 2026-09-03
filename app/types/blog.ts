/**
 * @file blog
 * @description Blog post types.
 *
 * @status None
 * @issues None
 * @todo None
 */

export interface BlogPostSummary {
  id: number
  titleFa: string
  slug: string
  seoDescription: string | null
  publishedAt: string | null
}

export interface BlogPostDetail {
  id: number
  titleFa: string
  slug: string
  contentHtml: string
  seoTitle: string | null
  seoDescription: string | null
  publishedAt: string | null
}

export interface BlogPost {
  id: number
  titleFa: string
  slug: string
  contentMd: string
  /** Rendered HTML (static demo only; used by the storefront blog detail). */
  contentHtml?: string
  seoTitle: string | null
  seoDescription: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}
