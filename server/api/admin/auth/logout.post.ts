/**
 * @file auth logout
 * @description POST /api/admin/auth/logout — clear the session cookie.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { clearSessionCookie } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  clearSessionCookie(event)
  return { ok: true }
})
