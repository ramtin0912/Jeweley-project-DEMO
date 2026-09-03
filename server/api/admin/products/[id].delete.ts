/**
 * @file products delete
 * @description DELETE /api/admin/products/:id — delete a product.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه نامعتبر است' })
  }
  await prisma.product.delete({ where: { id } })
  return { ok: true }
})
