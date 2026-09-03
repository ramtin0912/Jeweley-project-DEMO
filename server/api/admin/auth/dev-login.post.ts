/**
 * @file auth dev-login
 * @description POST /api/admin/auth/dev-login — one-click demo login (development only).
 *   Resolves the seeded default admin credentials server-side so the client never
 *   needs the secret. Returns 404 outside development.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { setSessionCookie, verifyPassword } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'یافت نشد' })
  }

  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin1234'
  const admin = await prisma.admin.findUnique({ where: { username: 'admin' } })
  if (!admin || !verifyPassword(defaultPassword, admin.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'کاربر پیش‌فرض یافت نشد' })
  }

  setSessionCookie(event, admin.id)
  return { ok: true }
})
