/**
 * @file demo
 * @description Public-demo read-only guard.
 *
 * When DEMO_MODE=true the admin panel becomes read-only: every non-GET request
 * to /api/admin/** (except the auth endpoints, which only read or set a session
 * cookie) is rejected so visitors can browse the backend snapshot — dashboard,
 * orders, finance, catalog — but can never mutate products, packages, orders,
 * posts, or upload images. This is the defense-in-depth that backs the hidden
 * write buttons on the client; never rely on the client alone.
 */
export default defineEventHandler((event) => {
  if (process.env.DEMO_MODE !== 'true') return

  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/admin/')) return

  // Allow auth so an owner/visitor can log in and view the read-only panel.
  if (path.startsWith('/api/admin/auth/')) return

  const method = event.method
  if (method !== 'GET' && method !== 'HEAD') {
    throw createError({
      statusCode: 403,
      statusMessage: 'حالت دمو — دسترسی فقط‌خواندنی است'
    })
  }
})
