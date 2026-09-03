/**
 * @file staticCatalog
 * @description Baked, self-contained catalog snapshot used to build the fully
 *   static GitHub Pages demo. Mirrors the demo content in `prisma/seed.ts` so the
 *   static storefront renders exactly like the live (full-stack) demo, but needs
 *   NO database at build time or runtime.
 *
 * The data is served to the public storefront GET endpoints by
 * `server/middleware/static-catalog.ts` when `NUXT_STATIC=true`. All shapes match
 * what the Prisma-backed handlers return, so the existing Vue pages work unchanged.
 *
 * @status Static demo data only — no DB required.
 * @issues None
 * @todo Replace with `prisma db ...` export when you want real content.
 */
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true })

// GitHub Pages serves the site under a base path (the repo name), so asset URLs
// in the baked data must include it. For a root-path build this is a no-op.
const siteBase = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/$/, '')
function asset(path: string): string {
  return siteBase + path
}

export interface StaticVariant {
  id: number
  label: string
  value: string
  priceDeltaToman: number
  stockCount: number
}

export interface StaticCategory {
  id: number
  nameFa: string
  slug: string
  sortOrder: number
  _count?: { products: number }
}

export interface StaticProduct {
  id: number
  nameFa: string
  slug: string
  descriptionFa: string | null
  priceToman: number
  material: string | null
  weightGrams: number | null
  image: string | null
  status: string
  stockCount: number
  isExclusive: boolean
  seoTitle: string | null
  seoDescription: string | null
  category: StaticCategory
  variants: StaticVariant[]
}

export interface StaticPackageItem {
  id: number
  quantity: number
  product: StaticProduct
  variant: StaticVariant | null
}

export interface StaticPackage {
  id: number
  nameFa: string
  slug: string
  descriptionFa: string | null
  priceToman: number
  image: string | null
  status: string
  stockCount: number
  seoTitle: string | null
  seoDescription: string | null
  items: StaticPackageItem[]
}

export interface StaticPortfolioWork {
  id: number
  titleFa: string
  descriptionFa: string | null
  image: string | null
  material: string | null
  year: number | null
  isFeatured: boolean
}

export interface StaticPost {
  id: number
  titleFa: string
  slug: string
  contentMd: string
  contentHtml: string
  seoTitle: string | null
  seoDescription: string | null
  published: boolean
  publishedAt: string
}

// -------------------------------------------------------------------------
// Categories
// -------------------------------------------------------------------------
const categories: StaticCategory[] = [
  { id: 1, nameFa: 'گردنبند', slug: 'necklace', sortOrder: 1, _count: { products: 3 } },
  { id: 2, nameFa: 'دستبند', slug: 'bracelet', sortOrder: 2, _count: { products: 1 } },
  { id: 3, nameFa: 'گوشواره', slug: 'earrings', sortOrder: 3, _count: { products: 1 } },
  { id: 4, nameFa: 'انگشتر', slug: 'ring', sortOrder: 4, _count: { products: 1 } }
]

const byCategory = (id: number): StaticCategory => categories.find((c) => c.id === id)!

// -------------------------------------------------------------------------
// Products (status ACTIVE) — mirrors `prisma/seed.ts`
// -------------------------------------------------------------------------
function makeProduct(p: {
  id: number
  categoryId: number
  nameFa: string
  slug: string
  descriptionFa: string
  image: string
  priceToman: number
  material: string
  weightGrams: number
  stockCount: number
  isExclusive?: boolean
  variants?: Omit<StaticVariant, 'id'>[]
}): StaticProduct {
  return {
    id: p.id,
    nameFa: p.nameFa,
    slug: p.slug,
    descriptionFa: p.descriptionFa,
    priceToman: p.priceToman,
    material: p.material,
    weightGrams: p.weightGrams,
    image: asset(p.image),
    status: 'ACTIVE',
    stockCount: p.stockCount,
    isExclusive: p.isExclusive ?? false,
    seoTitle: p.nameFa,
    seoDescription: p.descriptionFa,
    category: byCategory(p.categoryId),
    variants: (p.variants ?? []).map((v, i) => ({ id: p.id * 10 + i + 1, ...v }))
  }
}

const products: StaticProduct[] = [
  makeProduct({
    id: 1,
    categoryId: 1,
    nameFa: 'گردنبند نقره طرح ماه',
    slug: 'gardanband-mah',
    descriptionFa: 'گردنبند نقره ۹۲۵ با آویز طرح ماه، سبک و مناسب استفاده روزمره.',
    image: '/images/products/gardanband-mah.jpg',
    priceToman: 1_250_000,
    material: 'نقره ۹۲۵',
    weightGrams: 8.5,
    stockCount: 3,
    variants: [
      { label: 'طول زنجیر', value: '۴۰ سانتی‌متر', priceDeltaToman: 0, stockCount: 3 },
      { label: 'طول زنجیر', value: '۴۵ سانتی‌متر', priceDeltaToman: 100_000, stockCount: 2 }
    ]
  }),
  makeProduct({
    id: 2,
    categoryId: 1,
    nameFa: 'گردنبند نقره مینیمال',
    slug: 'gardanband-minimal',
    descriptionFa: 'گردنبند ظریف و مینیمال نقره، بدون نگین و مناسب استایل روزمره.',
    image: '/images/products/gardanband-minimal.jpg',
    priceToman: 980_000,
    material: 'نقره ۹۲۵',
    weightGrams: 5.2,
    stockCount: 5
  }),
  makeProduct({
    id: 3,
    categoryId: 2,
    nameFa: 'دستبند نقره زنجیری',
    slug: 'dastband-zanjiri',
    descriptionFa: 'دستبند زنجیری نقره با قفل محکم و روکش ضد حساسیت.',
    image: '/images/products/dastband-zanjiri.jpg',
    priceToman: 1_450_000,
    material: 'نقره ۹۲۵',
    weightGrams: 12.0,
    stockCount: 4
  }),
  makeProduct({
    id: 4,
    categoryId: 3,
    nameFa: 'گوشواره نقره اشکی',
    slug: 'gushvare-ashki',
    descriptionFa: 'گوشواره آویز اشکی نقره، سبک و مناسب هدیه.',
    image: '/images/products/gushvare-ashki.jpg',
    priceToman: 720_000,
    material: 'نقره ۹۲۵',
    weightGrams: 4.0,
    stockCount: 6
  }),
  makeProduct({
    id: 5,
    categoryId: 4,
    nameFa: 'انگشتر نقره عقیق',
    slug: 'angoshtar-aghigh',
    descriptionFa: 'انگشتر نقره با نگین عقیق طبیعی، سایز قابل تنظیم.',
    image: '/images/products/angoshtar-aghigh.jpg',
    priceToman: 1_100_000,
    material: 'نقره ۹۲۵ و عقیق',
    weightGrams: 7.8,
    stockCount: 2
  }),
  makeProduct({
    id: 6,
    categoryId: 1,
    nameFa: 'گردنبند نقره اختصاصی',
    slug: 'gardanband-ekhtesasi',
    descriptionFa: 'قطعه تک و اختصاصی با دست‌ساز کامل و طرح منحصر به فرد.',
    image: '/images/products/gardanband-ekhtesasi.jpg',
    priceToman: 3_500_000,
    material: 'نقره ۹۲۵',
    weightGrams: 15.0,
    stockCount: 1,
    isExclusive: true
  })
]

const productBySlug = (slug: string): StaticProduct | undefined =>
  products.find((p) => p.slug === slug)

// -------------------------------------------------------------------------
// Packages — mirrors `prisma/seed.ts`
// -------------------------------------------------------------------------
let packageItemSeq = 0
function makePackage(p: {
  id: number
  nameFa: string
  slug: string
  descriptionFa: string
  image: string
  priceToman: number
  stockCount: number
  items: { productSlug: string; quantity: number }[]
}): StaticPackage {
  return {
    id: p.id,
    nameFa: p.nameFa,
    slug: p.slug,
    descriptionFa: p.descriptionFa,
    priceToman: p.priceToman,
    image: asset(p.image),
    status: 'ACTIVE',
    stockCount: p.stockCount,
    seoTitle: p.nameFa,
    seoDescription: p.descriptionFa,
    items: p.items.map((item) => ({
      id: ++packageItemSeq,
      quantity: item.quantity,
      product: productBySlug(item.productSlug)!,
      variant: null
    }))
  }
}

const packages: StaticPackage[] = [
  makePackage({
    id: 1,
    nameFa: 'ست نقره هدیه',
    slug: 'set-noqreh-hediyeh',
    descriptionFa: 'ست گردنبند و دستبند نقره، بسته‌بندی هدیه.',
    image: '/images/packages/set-noqreh-hediyeh.jpg',
    priceToman: 2_200_000,
    stockCount: 2,
    items: [
      { productSlug: 'gardanband-mah', quantity: 1 },
      { productSlug: 'dastband-zanjiri', quantity: 1 }
    ]
  }),
  makePackage({
    id: 2,
    nameFa: 'پکیج هدیه عروس',
    slug: 'hediyeh-aroos',
    descriptionFa: 'ست گردنبند مینیمال و گوشواره اشکی، مناسب هدیه عروس.',
    image: '/images/packages/hediyeh-aroos.jpg',
    priceToman: 1_650_000,
    stockCount: 1,
    items: [
      { productSlug: 'gardanband-minimal', quantity: 1 },
      { productSlug: 'gushvare-ashki', quantity: 1 }
    ]
  })
]

// -------------------------------------------------------------------------
// Portfolio — mirrors `prisma/seed.ts`
// -------------------------------------------------------------------------
const portfolio: StaticPortfolioWork[] = [
  {
    id: 1,
    titleFa: 'گردنبند سفارشی عروس',
    descriptionFa: 'سفارش اختصاصی با زیرکن و پرداخت دستی.',
    image: '/images/portfolio/portfolio-necklace.jpg',
    material: 'نقره و زیرکن',
    year: 1403,
    isFeatured: true
  },
  {
    id: 2,
    titleFa: 'دستبند دست‌ساز گره',
    descriptionFa: 'بافت گره سنتی با مفتول نقره.',
    image: '/images/portfolio/portfolio-bracelet.jpg',
    material: 'نقره ۹۲۵',
    year: 1402,
    isFeatured: false
  },
  {
    id: 3,
    titleFa: 'ست گوشواره و گردنبند مروارید',
    descriptionFa: 'ترکیب مروارید طبیعی و نقره.',
    image: '/images/portfolio/portfolio-pearl-set.jpg',
    material: 'نقره و مروارید',
    year: 1401,
    isFeatured: false
  }
].map((w) => (w.image ? { ...w, image: asset(w.image) } : w))

// -------------------------------------------------------------------------
// Blog posts — mirrors `prisma/seed.ts`
// -------------------------------------------------------------------------
const posts: StaticPost[] = [
  {
    id: 1,
    titleFa: 'راهنمای انتخاب گردنبند نقره',
    slug: 'rahnama-nekland-noqreh',
    contentMd: `# راهنمای انتخاب گردنبند نقره

انتخاب گردنبند نقره مناسب به فرم صورت، استایل شخصی و موقعیت استفاده بستگی دارد. نقره ۹۲۵ با عیار بالا برای استفاده روزمره مناسب است و حساسیت ایجاد نمی‌کند.

## نکات مهم

- به طول زنجیر توجه کنید؛ زنجیر کوتاه برای یقه‌های باز مناسب است.
- برای پوست حساس از نقره ۹۲۵ استفاده کنید.
- طرح‌های مینیمال برای استفاده روزمره بهترند.`,
    contentHtml: md.render(`# راهنمای انتخاب گردنبند نقره

انتخاب گردنبند نقره مناسب به فرم صورت، استایل شخصی و موقعیت استفاده بستگی دارد. نقره ۹۲۵ با عیار بالا برای استفاده روزمره مناسب است و حساسیت ایجاد نمی‌کند.

## نکات مهم

- به طول زنجیر توجه کنید؛ زنجیر کوتاه برای یقه‌های باز مناسب است.
- برای پوست حساس از نقره ۹۲۵ استفاده کنید.
- طرح‌های مینیمال برای استفاده روزمره بهترند.`),
    seoTitle: 'راهنمای انتخاب گردنبند نقره',
    seoDescription: 'چگونه گردنبند نقره مناسب خود را انتخاب کنیم.',
    published: true,
    publishedAt: '2026-08-30T11:00:00.000Z'
  }
]

const postBySlug = (slug: string): StaticPost | undefined =>
  posts.find((p) => p.slug === slug)

// -------------------------------------------------------------------------
// Demo orders (admin panel) — mirrors `prisma/seed.ts` so the dashboard, orders,
// and finance pages render a realistic read-only snapshot. Dates are relative to
// the build time (same idea as the seed's `daysAgo`), so the finance trend lands
// across the recent Shamsi months whatever day the site is built.
// -------------------------------------------------------------------------
export interface StaticOrderItem {
  id: number
  nameFa: string
  priceToman: number
  quantity: number
  variantLabel: string | null
}

export interface StaticOrder {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  province: string
  city: string
  address: string
  postalCode: string | null
  status: string
  totalToman: number
  paidAt: string | null
  createdAt: string
  items: StaticOrderItem[]
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(11, 0, 0, 0)
  return d
}

interface SpecItem {
  itemType: 'product' | 'package'
  itemId: number
  nameFa: string
  priceToman: number
  quantity: number
}
interface SpecOrder {
  daysAgo: number
  status: string
  customerName: string
  customerPhone: string
  province: string
  city: string
  address: string
  postalCode: string | null
  items: SpecItem[]
}

const pItem = (slug: string, quantity: number): SpecItem => {
  const pr = productBySlug(slug)!
  return { itemType: 'product', itemId: pr.id, nameFa: pr.nameFa, priceToman: pr.priceToman, quantity }
}
const kItem = (slug: string, quantity: number): SpecItem => {
  const pk = packages.find((x) => x.slug === slug)!
  return { itemType: 'package', itemId: pk.id, nameFa: pk.nameFa, priceToman: pk.priceToman, quantity }
}

const orderSeeds: SpecOrder[] = [
  { daysAgo: 2, status: 'DELIVERED', customerName: 'سارا محمدی', customerPhone: '09121234501', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲', postalCode: '19968', items: [pItem('gardanband-mah', 1)] },
  { daysAgo: 5, status: 'SHIPPED', customerName: 'امیر حسینی', customerPhone: '09133456702', province: 'اصفهان', city: 'اصفهان', address: 'خیابان چهارباغ بالا، پلاک ۴۵', postalCode: '81739', items: [pItem('gushvare-ashki', 2)] },
  { daysAgo: 8, status: 'PENDING', customerName: 'نازنین رضایی', customerPhone: '09141234503', province: 'فارس', city: 'شیراز', address: 'معالی‌آباد، خیابان شهریار، پلاک ۸', postalCode: null, items: [pItem('angoshtar-aghigh', 1)] },
  { daysAgo: 11, status: 'CANCELED', customerName: 'رضا کریمی', customerPhone: '09121234504', province: 'خراسان رضوی', city: 'مشهد', address: 'بلوار سجاد، خیابان آب و برق، پلاک ۲۰', postalCode: '91879', items: [pItem('gardanband-ekhtesasi', 1)] },
  { daysAgo: 15, status: 'DELIVERED', customerName: 'مریم احمدی', customerPhone: '09151234505', province: 'تهران', city: 'تهران', address: 'خیابان فرشته، بن‌بست نهم، پلاک ۳', postalCode: '19669', items: [kItem('set-noqreh-hediyeh', 1)] },
  { daysAgo: 22, status: 'DELIVERED', customerName: 'علی نوری', customerPhone: '09141234506', province: 'آذربایجان شرقی', city: 'تبریز', address: 'خیابان امام، روبروی پارک، پلاک ۱۵', postalCode: '51368', items: [pItem('dastband-zanjiri', 1)] },
  { daysAgo: 28, status: 'SHIPPED', customerName: 'فاطمه صادقی', customerPhone: '09191234507', province: 'البرز', city: 'کرج', address: 'مهرشهر، بلوار ارم، خیابان ۱۰۸', postalCode: '31844', items: [kItem('hediyeh-aroos', 1)] },
  { daysAgo: 34, status: 'PAID', customerName: 'حسین عظیمی', customerPhone: '09123456708', province: 'اصفهان', city: 'کاشان', address: 'خیابان فاضل نراقی، پلاک ۲', postalCode: '87159', items: [pItem('gardanband-minimal', 1), pItem('angoshtar-aghigh', 1)] },
  { daysAgo: 40, status: 'CANCELED', customerName: 'لیلا مرادی', customerPhone: '09121234509', province: 'قم', city: 'قم', address: 'خیابان ارم، کوچه صدف، پلاک ۷', postalCode: '37185', items: [pItem('gushvare-ashki', 1)] },
  { daysAgo: 46, status: 'DELIVERED', customerName: 'محمد قاسمی', customerPhone: '09151234510', province: 'تهران', city: 'تهران', address: 'نیاوران، خیابان کامرانیه، پلاک ۲۲', postalCode: '19769', items: [pItem('gardanband-ekhtesasi', 1)] },
  { daysAgo: 55, status: 'DELIVERED', customerName: 'زهرا طاهری', customerPhone: '09171234511', province: 'فارس', city: 'شیراز', address: 'خیابان زند، کوچه ۵، پلاک ۹', postalCode: '71348', items: [pItem('gardanband-mah', 1)] },
  { daysAgo: 66, status: 'SHIPPED', customerName: 'امید رحیمی', customerPhone: '09151234512', province: 'خراسان رضوی', city: 'مشهد', address: 'خیابان امام رضا، پلاک ۳۳', postalCode: '91376', items: [kItem('set-noqreh-hediyeh', 1)] },
  { daysAgo: 78, status: 'DELIVERED', customerName: 'الهام صفایی', customerPhone: '09121234513', province: 'تهران', city: 'تهران', address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۱۴', postalCode: '19978', items: [pItem('dastband-zanjiri', 1), pItem('gushvare-ashki', 1)] },
  { daysAgo: 88, status: 'DELIVERED', customerName: 'بهرام نظری', customerPhone: '09131234514', province: 'اصفهان', city: 'اصفهان', address: 'خیابان توحید، کوچه ۱۲، پلاک ۵', postalCode: '81666', items: [pItem('angoshtar-aghigh', 1)] },
  { daysAgo: 98, status: 'SHIPPED', customerName: 'شیرین کاظمی', customerPhone: '09141234515', province: 'آذربایجان شرقی', city: 'مراغه', address: 'خیابان ملک‌کاظم، پلاک ۱۸', postalCode: '55136', items: [pItem('gardanband-minimal', 2)] },
  { daysAgo: 108, status: 'DELIVERED', customerName: 'پریسا جعفری', customerPhone: '09121234516', province: 'تهران', city: 'تهران', address: 'پاسداران، خیابان گلستان، پلاک ۲۶', postalCode: '16667', items: [pItem('gardanband-mah', 1), pItem('dastband-zanjiri', 1)] },
  { daysAgo: 118, status: 'DELIVERED', customerName: 'کامران یوسفی', customerPhone: '09171234517', province: 'فارس', city: 'شیراز', address: 'بلوار آزادی، خیابان گلستان، پلاک ۳', postalCode: '71449', items: [kItem('set-noqreh-hediyeh', 1)] },
  { daysAgo: 128, status: 'DELIVERED', customerName: 'نسترن احدی', customerPhone: '09123456718', province: 'البرز', city: 'کرج', address: 'عظیمیه، بلوار طالقانی، پلاک ۱۱', postalCode: '31767', items: [pItem('gushvare-ashki', 1), pItem('angoshtar-aghigh', 1)] }
]

const orders: StaticOrder[] = orderSeeds.map((seed, i) => {
  const createdAt = daysAgo(seed.daysAgo)
  const paidAt = seed.status === 'PENDING' || seed.status === 'CANCELED' ? null : createdAt
  const totalToman = seed.items.reduce((sum, it) => sum + it.priceToman * it.quantity, 0)
  return {
    id: i + 1,
    orderNumber: `JS-SEED-${1000 + i}`,
    customerName: seed.customerName,
    customerPhone: seed.customerPhone,
    province: seed.province,
    city: seed.city,
    address: seed.address,
    postalCode: seed.postalCode,
    status: seed.status,
    totalToman,
    paidAt: paidAt ? paidAt.toISOString() : null,
    createdAt: createdAt.toISOString(),
    items: seed.items.map((it, j) => ({
      id: (i + 1) * 100 + j + 1,
      nameFa: it.nameFa,
      priceToman: it.priceToman,
      quantity: it.quantity,
      variantLabel: null
    }))
  }
})

// -------------------------------------------------------------------------
// Public API response shapes (match the Prisma-backed handlers)
// -------------------------------------------------------------------------
export const staticCatalog = {
  categories,
  products,
  packages,
  portfolio,
  posts,
  orders
}

/** List of every static page route the SSG build should prerender. */
export const staticPrerenderRoutes: string[] = [
  '/',
  '/packages',
  '/portfolio',
  '/blog',
  '/checkout',
  '/order/success',
  '/order/failure',
  ...products.map((p) => `/products/${p.slug}`),
  ...posts.map((p) => `/blog/${p.slug}`),
  // Read-only admin panel (baked data, no server).
  '/admin',
  '/admin/login',
  '/admin/finance',
  '/admin/orders',
  '/admin/products',
  '/admin/packages',
  '/admin/portfolio',
  '/admin/posts',
  // Public API indexes baked as static JSON (used by the client sandbox store as a
  // fallback; the per-page data is embedded in each route's payload via the store).
  '/api/categories',
  '/api/products',
  '/api/packages',
  '/api/portfolio',
  // Admin API baked as static JSON (read-only, no server).
  '/api/admin/auth/me',
  '/api/admin/categories',
  '/api/admin/products',
  '/api/admin/packages',
  '/api/admin/portfolio',
  '/api/admin/posts',
  '/api/admin/orders',
  '/api/admin/finance',
  '/api/admin/earnings'
]

/** Resolve a public catalog endpoint path to its payload, or `undefined`. */
export function resolveStaticCatalog(pathname: string): {
  body: unknown
  status?: number
} | null {
  // Strip any base path prefix (e.g. /Jeweley-project-DEMO/) and keep from /api/.
  const apiIndex = pathname.indexOf('/api/')
  const api = apiIndex === -1 ? undefined : pathname.slice(apiIndex)

  if (!api || !api.startsWith('/api/')) return null

  switch (true) {
    case api === '/api/categories':
      return { body: staticCatalog.categories }
    case api === '/api/products':
      return { body: staticCatalog.products }
    case api.startsWith('/api/products/'): {
      const slug = api.slice('/api/products/'.length)
      const product = productBySlug(slug)
      return product ? { body: product } : { body: { message: 'محصول یافت نشد' }, status: 404 }
    }
    case api === '/api/packages':
      return { body: staticCatalog.packages }
    case api === '/api/portfolio':
      return { body: staticCatalog.portfolio }
    case api === '/api/posts':
      return {
        body: staticCatalog.posts
          .filter((p) => p.published)
          .map((p) => ({
            id: p.id,
            titleFa: p.titleFa,
            slug: p.slug,
            seoDescription: p.seoDescription,
            publishedAt: p.publishedAt
          }))
      }
    case api.startsWith('/api/posts/'): {
      const slug = api.slice('/api/posts/'.length)
      const post = postBySlug(slug)
      return post
        ? {
            body: {
              id: post.id,
              titleFa: post.titleFa,
              slug: post.slug,
              contentHtml: post.contentHtml,
              seoTitle: post.seoTitle,
              seoDescription: post.seoDescription,
              publishedAt: post.publishedAt
            }
          }
        : { body: { message: 'پست یافت نشد' }, status: 404 }
    }
    default:
      return null
  }
}
