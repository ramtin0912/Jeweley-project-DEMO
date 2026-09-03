/**
 * @file static-catalog
 * @description Static-data middleware for the fully static GitHub Pages build.
 *
 * When `NUXT_STATIC=true` (see nuxt.config runtimeConfig.public.staticMode) the public
 * storefront GET endpoints AND the read-only admin GET endpoints are served from the
 * baked `server/data/staticCatalog` snapshot instead of Prisma/Postgres. This lets
 * `nuxt generate` prerender every page (storefront + admin) with real data and NO
 * database at build time — and since the site is fully static, no database is needed at
 * runtime either. Ads, checkout POSTs, and admin writes are never invoked by the build.
 *
 * The admin panel is read-only here (DEMO_MODE=true hides the write buttons) and is
 * auto-authenticated: `GET /api/admin/auth/me` returns a baked admin, and the admin
 * layout skips the session check in static mode.
 *
 * @status Static demo only.
 * @issues None
 * @todo None
 */
import { resolveStaticCatalog, staticCatalog } from '../data/staticCatalog'
import { computeStatusBreakdown } from '~~/app/utils/orderStatus'
import {
  aggregateIntoBuckets,
  aggregateProductRevenue,
  buildMonthRange,
  computeTotals
} from '~~/app/utils/finance'
import type { PaidSale, SaleItem } from '~~/app/utils/finance'
import { toShamsiYearMonth } from '~~/app/utils/shamsiDate'

const DEFAULT_MONTH_PER_PAGE = 12
const MAX_MONTH_PER_PAGE = 60

function adminMe(): { id: number; username: string } {
  return { id: 1, username: 'admin' }
}

function adminOrders() {
  const orders = staticCatalog.orders
  return {
    orders,
    statusBreakdown: computeStatusBreakdown(
      orders.map((o) => ({ status: o.status, totalToman: o.totalToman }))
    )
  }
}

function paidItems(): SaleItem[] {
  return staticCatalog.orders
    .filter((o) => o.paidAt !== null)
    .flatMap((o) =>
      o.items.map((it) => ({
        itemId: it.id,
        nameFa: it.nameFa,
        priceToman: it.priceToman,
        quantity: it.quantity
      }))
    )
}

function paidSales(): PaidSale[] {
  return staticCatalog.orders
    .filter((o) => o.paidAt !== null)
    .map((o) => ({ paidAt: o.paidAt ?? o.createdAt, totalToman: o.totalToman }))
}

function adminEarnings() {
  const totals = computeTotals(paidSales(), new Date())
  return {
    totalRevenue: totals.totalRevenue,
    orderCount: totals.orderCount,
    thisMonthRevenue: totals.thisMonthRevenue,
    thisMonthOrderCount: totals.thisMonthOrderCount,
    lastMonthRevenue: totals.lastMonthRevenue,
    todayRevenue: totals.todayRevenue,
    perProduct: aggregateProductRevenue(paidItems()),
    recentOrders: staticCatalog.orders.slice(0, 10).map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      totalToman: o.totalToman,
      status: o.status,
      createdAt: o.createdAt,
      paidAt: o.paidAt,
      itemCount: o.items.length
    }))
  }
}

function adminFinance(monthPage: number, monthPerPage: number) {
  const sales = paidSales()
  const totals = computeTotals(sales, new Date())
  const reference = new Date()
  const currentYM = toShamsiYearMonth(reference)
  let startYM = currentYM
  for (const sale of sales) {
    const ym = toShamsiYearMonth(sale.paidAt)
    if (ym.year < startYM.year || (ym.year === startYM.year && ym.month < startYM.month)) {
      startYM = ym
    }
  }
  const allBuckets = buildMonthRange(startYM, currentYM)
  aggregateIntoBuckets(allBuckets, sales)
  const monthTotal = allBuckets.length
  const startIdx = Math.max(0, monthTotal - monthPage * monthPerPage)
  const monthly = allBuckets.slice(
    startIdx,
    Math.max(startIdx, monthTotal - (monthPage - 1) * monthPerPage)
  )
  return {
    totals,
    monthly,
    monthTotal,
    monthPage,
    monthPerPage,
    perProduct: aggregateProductRevenue(paidItems())
  }
}

function resolveAdmin(
  api: string,
  query: Record<string, unknown>
): { body: unknown; status?: number } | null {
  switch (true) {
    case api === '/api/admin/auth/me':
      return { body: adminMe() }
    case api === '/api/admin/categories':
      return { body: staticCatalog.categories }
    case api === '/api/admin/products':
      return { body: staticCatalog.products }
    case api === '/api/admin/packages':
      return { body: staticCatalog.packages }
    case api === '/api/admin/portfolio':
      return { body: staticCatalog.portfolio }
    case api === '/api/admin/posts':
      return {
        body: staticCatalog.posts.map((p) => ({
          id: p.id,
          titleFa: p.titleFa,
          slug: p.slug,
          contentMd: p.contentMd,
          contentHtml: p.contentHtml,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          published: p.published,
          publishedAt: p.publishedAt,
          createdAt: p.publishedAt,
          updatedAt: p.publishedAt
        }))
      }
    case api === '/api/admin/orders':
      return { body: adminOrders() }
    case api === '/api/admin/finance': {
      const monthPage = Math.max(1, Number(query.monthPage) || 1)
      const monthPerPage = Math.min(
        MAX_MONTH_PER_PAGE,
        Math.max(1, Number(query.monthPerPage) || DEFAULT_MONTH_PER_PAGE)
      )
      return { body: adminFinance(monthPage, monthPerPage) }
    }
    case api === '/api/admin/earnings':
      return { body: adminEarnings() }
    default:
      return null
  }
}

export default defineEventHandler((event) => {
  const cfg = useRuntimeConfig(event)
  if (cfg.public.staticMode !== true) return

  const method = event.method
  if (method !== 'GET' && method !== 'HEAD') return

  const { pathname } = getRequestURL(event)
  const apiIndex = pathname.indexOf('/api/')
  const api = apiIndex === -1 ? undefined : pathname.slice(apiIndex)

  const resolved =
    api && api.startsWith('/api/admin/')
      ? resolveAdmin(api, getQuery(event) as Record<string, unknown>)
      : resolveStaticCatalog(pathname)

  if (!resolved) return

  if (resolved.status && resolved.status >= 400) {
    throw createError({ statusCode: resolved.status, statusMessage: 'یافت نشد' })
  }

  return resolved.body
})
