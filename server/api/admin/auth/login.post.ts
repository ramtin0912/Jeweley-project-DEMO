/**
 * @file auth login
 * @description POST /api/admin/auth/login — verify admin credentials and set a session cookie.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { setSessionCookie, verifyPassword } from '~~/server/utils/auth'

const schema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات ورود نامعتبر است' })
  }

  const admin = await prisma.admin.findUnique({ where: { username: parsed.data.username } })
  if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'نام کاربری یا رمز عبور اشتباه است' })
  }

  setSessionCookie(event, admin.id)
  return { ok: true }
})
