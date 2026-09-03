// story: e02s01
/**
 * @file kavenegar
 * @description Kavenegar SMS OTP sender. Logs the code to console when no API key is set (dev mode).
 *
 * @status Dev fallback: logs code when KAVENEGAR_API_KEY is unset
 * @issues None
 * @todo None
 */
import { normalizePhone } from './otp'

/**
 * Deliver an OTP by SMS (Kavenegar) — or to the dev console when no API key is set.
 * Returns the delivery mode so callers can expose the code to the client in dev
 * (auto-fill) without ever exposing it in real-SMS mode.
 */
export async function sendOtp(phone: string, code: string): Promise<'dev' | 'sms'> {
  const apiKey = process.env.KAVENEGAR_API_KEY
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || 'orderverify'
  const receptor = normalizePhone(phone)

  if (!apiKey) {
    // Dev fallback — no API key configured, print the code for local testing.
    console.log(`[DEV OTP] phone=${receptor} code=${code}`)
    return 'dev'
  }

  const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`
  const response = await $fetch<{ return?: { status?: number; message?: string } }>(url, {
    query: { receptor, token: code, template },
    timeout: 10_000
  })

  if (response.return?.status !== 200) {
    throw createError({ statusCode: 502, statusMessage: 'ارسال پیامک ناموفق بود' })
  }

  return 'sms'
}
