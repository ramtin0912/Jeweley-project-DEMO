/**
 * @file payment callback
 * @description GET /api/payment/callback — verify Zarinpal payment, mark order PAID,
 *   reserve stock, then redirect to success/failure pages.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'
import { verifyPayment } from '~~/server/utils/zarinpal'
import { reserveStock } from '~~/server/utils/stock'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const authority = typeof query.Authority === 'string' ? query.Authority : undefined
  const status = typeof query.Status === 'string' ? query.Status : undefined

  if (!authority) {
    return sendRedirect(event, '/order/failure', 302)
  }

  const order = await prisma.order.findFirst({ where: { authority } })
  if (!order) {
    return sendRedirect(event, '/order/failure', 302)
  }

  if (order.status === 'PAID') {
    return sendRedirect(event, `/order/success?orderNumber=${order.orderNumber}`, 302)
  }

  if (status !== 'OK') {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELED' } })
    return sendRedirect(event, '/order/failure', 302)
  }

  let result: { success: boolean; refId: string | null }
  try {
    result = await verifyPayment({ amountToman: order.totalToman, authority })
  } catch {
    return sendRedirect(event, '/order/failure', 302)
  }

  if (!result.success) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELED' } })
    return sendRedirect(event, '/order/failure', 302)
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: 'PAID', refId: result.refId, paidAt: new Date() }
  })
  await reserveStock(order.id)

  return sendRedirect(event, `/order/success?orderNumber=${order.orderNumber}`, 302)
})
