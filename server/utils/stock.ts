/**
 * @file stock
 * @description Reserve stock for a paid order (decrement the most specific unit).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { prisma } from '~~/server/utils/prisma'

export async function reserveStock(orderId: number): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  })
  if (!order) {
    return
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.itemType === 'package') {
        await tx.package.updateMany({
          where: { id: item.itemId, stockCount: { gte: item.quantity } },
          data: { stockCount: { decrement: item.quantity } }
        })
      } else if (item.variantId) {
        await tx.productVariant.updateMany({
          where: { id: item.variantId, stockCount: { gte: item.quantity } },
          data: { stockCount: { decrement: item.quantity } }
        })
      } else {
        await tx.product.updateMany({
          where: { id: item.itemId, stockCount: { gte: item.quantity } },
          data: { stockCount: { decrement: item.quantity } }
        })
      }
    }
  })
}
