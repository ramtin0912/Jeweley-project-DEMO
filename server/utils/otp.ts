/**
 * @file otp
 * @description OTP code generation, phone normalization, and HMAC hashing.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

export function normalizePhone(phone: string): string {
  return phone
    .trim()
    .replace(/[\s-]/g, '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
}

export function isValidIranianPhone(phone: string): boolean {
  return /^09\d{9}$/.test(normalizePhone(phone))
}

export function generateOtpCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

function otpPepper(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.DATABASE_URL || 'dev-otp-pepper'
}

export function hashOtpCode(phone: string, code: string): string {
  return createHmac('sha256', otpPepper()).update(`${phone}:${code}`).digest('hex')
}

export function verifyOtpCode(phone: string, code: string, expectedHash: string): boolean {
  const actual = hashOtpCode(phone, code)
  const a = Buffer.from(actual, 'hex')
  const b = Buffer.from(expectedHash, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}
