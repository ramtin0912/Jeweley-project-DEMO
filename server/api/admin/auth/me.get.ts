/**
 * @file auth me
 * @description GET /api/admin/auth/me — return the current admin if authenticated.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { getSessionAdminId } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const adminId = getSessionAdminId(event)
  if (!adminId) {
    throw createError({ statusCode: 401, statusMessage: 'لطفاً وارد شوید' })
  }
  const admin = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!admin) {
    throw createError({ statusCode: 401, statusMessage: 'لطفاً وارد شوید' })
  }
  return { id: admin.id, username: admin.username }
})
