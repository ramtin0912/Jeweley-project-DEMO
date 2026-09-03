/**
 * @file orders update
 * @description PATCH /api/admin/orders/:id — update an order's status.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

const schema = z.object({
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED'])
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'شناسه نامعتبر است' })
  }
  const parsed = schema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'وضعیت نامعتبر است' })
  }
  return prisma.order.update({ where: { id }, data: { status: parsed.data.status } })
})
