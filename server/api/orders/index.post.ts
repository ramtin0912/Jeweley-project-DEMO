/**
 * @file orders index
 * @description POST /api/orders — verify OTP, re-price items from DB, create an order,
 *   then either mark it paid (DEMO_PAYMENT=true, no gateway) and redirect to the success
 *   page, or request a Zarinpal payment and return its redirect URL.
 *
 * @status Demo-payment bypass wired; real gateway path intact (Zarinpal sandbox/prod)
 * @issues None
 * @todo None
 */
// story: e02s02
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { isValidIranianPhone, normalizePhone, verifyOtpCode } from '~~/server/utils/otp'
import { requestPayment, startPayUrl } from '~~/server/utils/zarinpal'
import { reserveStock } from '~~/server/utils/stock'

const itemSchema = z.object({
  itemType: z.enum(['product', 'package']),
  itemId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99),
  variantId: z.number().int().positive().optional()
})

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(15),
  province: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(5).max(500),
  postalCode: z.string().trim().max(20).optional(),
  otpCode: z.string().trim().length(5),
  items: z.array(itemSchema).min(1).max(50)
})

interface PricedItem {
  itemType: string
  itemId: number
  nameFa: string
  priceToman: number
  quantity: number
  variantId: number | null
  variantLabel: string | null
}

function generateOrderNumber(): string {
  const time = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `JS-${time}${rand}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'اطلاعات سفارش نامعتبر است' })
  }

  const data = parsed.data
  const phone = normalizePhone(data.phone)
  if (!isValidIranianPhone(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'شماره موبایل نامعتبر است' })
  }

  // 1. Verify OTP
  const otp = await prisma.otpCode.findFirst({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' }
  })
  if (!otp) {
    throw createError({ statusCode: 401, statusMessage: 'کد تأیید نامعتبر یا منقضی است' })
  }
  if (otp.attempts >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'تعداد تلاش‌ها بیش از حد مجاز است' })
  }
  if (!verifyOtpCode(phone, data.otpCode, otp.codeHash)) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
    throw createError({ statusCode: 400, statusMessage: 'کد تأیید اشتباه است' })
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

  // 2. Re-price items from DB (never trust client prices)
  const priced: PricedItem[] = []
  let totalToman = 0

  for (const item of data.items) {
    if (item.itemType === 'product') {
      const product = await prisma.product.findUnique({ where: { id: item.itemId } })
      if (!product || product.status !== 'ACTIVE') {
        throw createError({ statusCode: 400, statusMessage: 'محصولی در دسترس نیست' })
      }
      if (product.stockCount < item.quantity) {
        throw createError({ statusCode: 400, statusMessage: `موجودی «${product.nameFa}» کافی نیست` })
      }

      let price = product.priceToman
      let variantLabel: string | null = null
      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || variant.productId !== product.id) {
          throw createError({ statusCode: 400, statusMessage: 'تنوع انتخابی نامعتبر است' })
        }
        price += variant.priceDeltaToman
        variantLabel = `${variant.label}: ${variant.value}`
      }

      priced.push({
        itemType: 'product',
        itemId: product.id,
        nameFa: product.nameFa,
        priceToman: price,
        quantity: item.quantity,
        variantId: item.variantId ?? null,
        variantLabel
      })
      totalToman += price * item.quantity
    } else {
      const pkg = await prisma.package.findUnique({ where: { id: item.itemId } })
      if (!pkg || pkg.status !== 'ACTIVE') {
        throw createError({ statusCode: 400, statusMessage: 'پکیجی در دسترس نیست' })
      }
      if (pkg.stockCount < item.quantity) {
        throw createError({ statusCode: 400, statusMessage: `موجودی «${pkg.nameFa}» کافی نیست` })
      }

      priced.push({
        itemType: 'package',
        itemId: pkg.id,
        nameFa: pkg.nameFa,
        priceToman: pkg.priceToman,
        quantity: item.quantity,
        variantId: null,
        variantLabel: null
      })
      totalToman += pkg.priceToman * item.quantity
    }
  }

  // 3. Create the order (PENDING)
  const orderNumber = generateOrderNumber()
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: data.customerName,
      customerPhone: phone,
      province: data.province,
      city: data.city,
      address: data.address,
      postalCode: data.postalCode || null,
      totalToman,
      items: {
        create: priced.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          nameFa: item.nameFa,
          priceToman: item.priceToman,
          quantity: item.quantity,
          variantId: item.variantId,
          variantLabel: item.variantLabel
        }))
      }
    }
  })

  // 4. Mark paid (demo mode) or request Zarinpal payment (real mode)
  const demoPayment = process.env.DEMO_PAYMENT === 'true'
  if (demoPayment) {
    // Demo path — no gateway: mark the order paid immediately, reserve stock, and
    // send the buyer to the success page (which previews the receipt SMS).
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID', paidAt: new Date() }
    })
    await reserveStock(order.id)

    return {
      orderNumber: order.orderNumber,
      totalToman: order.totalToman,
      redirectUrl: `/order/success?orderNumber=${order.orderNumber}&name=${encodeURIComponent(order.customerName)}`
    }
  }

  const origin = getRequestURL(event).origin
  const authority = await requestPayment({
    amountToman: totalToman,
    description: `سفارش ${orderNumber}`,
    callbackUrl: `${origin}/payment/callback`,
    mobile: phone
  })
  await prisma.order.update({ where: { id: order.id }, data: { authority } })

  return {
    orderNumber: order.orderNumber,
    totalToman: order.totalToman,
    redirectUrl: startPayUrl(authority)
  }
})
