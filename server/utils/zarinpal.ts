/**
 * @file zarinpal
 * @description Zarinpal v4 payment request + verify (Toman, currency=IRT).
 *
 * @status Sandbox-ready
 * @issues None
 * @todo None
 */

interface ZarinpalResponse<T> {
  data?: T
  errors?: Array<{ code: number; message: string }> | { code: number; message: string }
}

function baseApiUrl(): string {
  return process.env.ZARINPAL_SANDBOX === 'true'
    ? 'https://sandbox.zarinpal.com'
    : 'https://api.zarinpal.com'
}

export function startPayUrl(authority: string): string {
  const base = process.env.ZARINPAL_SANDBOX === 'true'
    ? 'https://sandbox.zarinpal.com'
    : 'https://www.zarinpal.com'
  return `${base}/pg/StartPay/${authority}`
}

function merchantId(): string {
  const id = process.env.ZARINPAL_MERCHANT_ID
  if (!id) {
    throw createError({ statusCode: 500, statusMessage: 'درگاه پرداخت پیکربندی نشده است' })
  }
  return id
}

function extractErrorMessage(errors: unknown): string | null {
  if (!errors) return null
  if (Array.isArray(errors)) {
    return errors[0]?.message ?? null
  }
  if (typeof errors === 'object') {
    return (errors as { message?: string }).message ?? null
  }
  return null
}

export async function requestPayment(params: {
  amountToman: number
  description: string
  callbackUrl: string
  mobile?: string
}): Promise<string> {
  let response: ZarinpalResponse<{ authority: string }>
  try {
    response = await $fetch<ZarinpalResponse<{ authority: string }>>(
      `${baseApiUrl()}/pg/v4/payment/request.json`,
      {
        method: 'POST',
        body: {
          merchant_id: merchantId(),
          amount: params.amountToman,
          currency: 'IRT',
          description: params.description,
          callback_url: params.callbackUrl,
          metadata: params.mobile ? { mobile: params.mobile } : undefined
        },
        timeout: 15_000
      }
    )
  } catch (error) {
    const data = (error as { data?: { errors?: unknown } }).data
    const message = extractErrorMessage(data?.errors) ?? 'خطا در ایجاد درخواست پرداخت'
    throw createError({ statusCode: 502, statusMessage: message })
  }

  if (!response.data?.authority) {
    const message = extractErrorMessage(response.errors) ?? 'خطا در ایجاد درخواست پرداخت'
    throw createError({ statusCode: 502, statusMessage: message })
  }

  return response.data.authority
}

export async function verifyPayment(params: {
  amountToman: number
  authority: string
}): Promise<{ success: boolean; refId: string | null }> {
  let response: ZarinpalResponse<{ code?: number; ref_id?: string | number }>
  try {
    response = await $fetch<ZarinpalResponse<{ code?: number; ref_id?: string | number }>>(
      `${baseApiUrl()}/pg/v4/payment/verify.json`,
      {
        method: 'POST',
        body: {
          merchant_id: merchantId(),
          amount: params.amountToman,
          authority: params.authority
        },
        timeout: 15_000
      }
    )
  } catch (error) {
    // A structured error body means Zarinpal responded with a failed verification
    // (e.g. code -51 "session not paid") — not a network error.
    const data = (error as { data?: unknown }).data
    if (data) {
      return { success: false, refId: null }
    }
    throw error
  }

  const code = response.data?.code
  const success = code === 100 || code === 101
  const refId = response.data?.ref_id != null ? String(response.data.ref_id) : null
  return { success, refId }
}
