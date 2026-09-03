/**
 * @file useShopData
 * @description Client-side, per-browser sandbox data store for the static demo.
 *
 * The static site has no server/database, so every page is built from a baked catalog
 * snapshot. This composable layers a **per-visitor, localStorage-backed** copy of that
 * catalog on top, so a visitor can "play" with the admin (add/edit/delete products,
 * packages, portfolio, posts, change order statuses) and see the storefront react —
 * all inside their own browser only, never affecting anyone else or any server.
 *
 * Data flow:
 *   - SSR/prerender: `loadBaked()` fetches the baked `/api/*` snapshot into `useState`
 *     (so it's carried in the page payload and the default data is always correct).
 *   - Client: `applySandbox()` swaps in a saved localStorage snapshot if the visitor
 *     has one; otherwise the baked defaults are used.
 *   - Mutations call `persist()` so the visitor's edits survive a reload (their browser).
 *
 * Because edits live in `localStorage`, they are isolated per browser/device and never
 * shared. `resetDemo()` clears the sandbox and reloads the baked defaults.
 *
 * @status Client-only sandbox for the static demo.
 * @issues None
 * @todo None
 */
import type { Category, Product, Package, PortfolioWork } from '~/types/catalog'
import type { BlogPost } from '~/types/blog'
import type { Order } from '~/types/admin'

const STORAGE_KEY = 'evtag-demo-data'

export interface DemoData {
  categories: Category[]
  products: Product[]
  packages: Package[]
  portfolio: PortfolioWork[]
  posts: BlogPost[]
  orders: Order[]
}

function emptyData(): DemoData {
  return { categories: [], products: [], packages: [], portfolio: [], posts: [], orders: [] }
}

export function useShopData() {
  const data = useState<DemoData>('demo-shop-data', emptyData)
  const ready = useState<boolean>('demo-shop-ready', () => false)
  const fromSandbox = useState<boolean>('demo-shop-sandbox', () => false)

  async function loadBaked() {
    if (ready.value) return
    const [categories, products, packages, portfolio, posts, ordersRes] = await Promise.all([
      $fetch<Category[]>('/api/categories').catch(() => [] as Category[]),
      $fetch<Product[]>('/api/products').catch(() => [] as Product[]),
      $fetch<Package[]>('/api/packages').catch(() => [] as Package[]),
      $fetch<PortfolioWork[]>('/api/portfolio').catch(() => [] as PortfolioWork[]),
      $fetch<BlogPost[]>('/api/admin/posts').catch(() => [] as BlogPost[]),
      $fetch<{ orders: Order[] }>('/api/admin/orders').catch(() => ({ orders: [] as Order[] }))
    ])
    data.value = {
      categories,
      products,
      packages,
      portfolio,
      posts,
      orders: ordersRes.orders
    }
    ready.value = true
  }

  function applySandbox() {
    if (!import.meta.client) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      data.value = JSON.parse(saved) as DemoData
      fromSandbox.value = true
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
    fromSandbox.value = true
  }

  function resetDemo() {
    if (!import.meta.client) return
    localStorage.removeItem(STORAGE_KEY)
    fromSandbox.value = false
    window.location.reload()
  }

  // --- Products ---
  function addProduct(product: Product) {
    data.value.products.push(product)
    persist()
  }
  function updateProduct(id: number, patch: Partial<Product>) {
    const i = data.value.products.findIndex((x) => x.id === id)
    if (i >= 0) data.value.products[i] = { ...data.value.products[i], ...patch } as Product
    persist()
  }
  function deleteProduct(id: number) {
    data.value.products = data.value.products.filter((x) => x.id !== id)
    persist()
  }

  // --- Packages ---
  function addPackage(pkg: Package) {
    data.value.packages.push(pkg)
    persist()
  }
  function updatePackage(id: number, patch: Partial<Package>) {
    const i = data.value.packages.findIndex((x) => x.id === id)
    if (i >= 0) data.value.packages[i] = { ...data.value.packages[i], ...patch } as Package
    persist()
  }
  function deletePackage(id: number) {
    data.value.packages = data.value.packages.filter((x) => x.id !== id)
    persist()
  }

  // --- Portfolio ---
  function addPortfolioWork(work: PortfolioWork) {
    data.value.portfolio.push(work)
    persist()
  }
  function updatePortfolioWork(id: number, patch: Partial<PortfolioWork>) {
    const i = data.value.portfolio.findIndex((x) => x.id === id)
    if (i >= 0) data.value.portfolio[i] = { ...data.value.portfolio[i], ...patch } as PortfolioWork
    persist()
  }
  function deletePortfolioWork(id: number) {
    data.value.portfolio = data.value.portfolio.filter((x) => x.id !== id)
    persist()
  }

  // --- Posts ---
  function addPost(post: BlogPost) {
    data.value.posts.push(post)
    persist()
  }
  function updatePost(id: number, patch: Partial<BlogPost>) {
    const i = data.value.posts.findIndex((x) => x.id === id)
    if (i >= 0) data.value.posts[i] = { ...data.value.posts[i], ...patch } as BlogPost
    persist()
  }
  function deletePost(id: number) {
    data.value.posts = data.value.posts.filter((x) => x.id !== id)
    persist()
  }

  // --- Orders ---
  function updateOrderStatus(id: number, status: string) {
    const order = data.value.orders.find((x) => x.id === id)
    if (!order) return
    order.status = status
    if (status !== 'PENDING' && status !== 'CANCELED' && !order.paidAt) {
      order.paidAt = new Date().toISOString()
    }
    persist()
  }

  return {
    data,
    ready,
    fromSandbox,
    loadBaked,
    applySandbox,
    persist,
    resetDemo,
    addProduct,
    updateProduct,
    deleteProduct,
    addPackage,
    updatePackage,
    deletePackage,
    addPortfolioWork,
    updatePortfolioWork,
    deletePortfolioWork,
    addPost,
    updatePost,
    deletePost,
    updateOrderStatus
  }
}
