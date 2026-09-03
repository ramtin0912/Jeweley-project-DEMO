// story: e02s01
/**
 * @file otp send
 * @description POST /api/auth/otp/send — send a 5-digit OTP (Kavenegar, or console in dev).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { z } from 'zod'
import { prisma } from '~~/server/utils/prisma'
import { generateOtpCode, hashOtpCode, isValidIranianPhone, normalizePhone } from '~~/server/utils/otp'
import { sendOtp } from '~~/server/utils/kavenegar'

const schema = z.object({ phone: z.string().trim().min(10).max(15) })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'شماره موبایل نامعتبر است' })
  }

  const phone = normalizePhone(parsed.data.phone)
  if (!isValidIranianPhone(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'شماره موبایل نامعتبر است' })
  }

  // Rate limit: max 3 sends per 10 minutes per phone.
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const recent = await prisma.otpCode.count({ where: { phone, createdAt: { gte: tenMinutesAgo } } })
  if (recent >= 3) {
    throw createError({ statusCode: 429, statusMessage: 'درخواست بیش از حد. کمی صبر کنید' })
  }

  const code = generateOtpCode()
  const codeHash = hashOtpCode(phone, code)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await prisma.otpCode.create({ data: { phone, codeHash, expiresAt } })
  const deliveryMode = await sendOtp(phone, code)

  // Dev mode (no Kavenegar key): return the code so the checkout page can
  // auto-fill it. Real-SMS mode never exposes the code in the response.
  if (deliveryMode === 'dev') {
    return { ok: true, devCode: code }
  }
  return { ok: true }
})
