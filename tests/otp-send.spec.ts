// story: e02s01
/**
 * @file otp-send.spec
 * @description Delivery-mode contract for sendOtp: 'dev' (no Kavenegar key —
 * code is console-logged and MUST be returned to the client for auto-fill)
 * vs 'sms' (real Kavenegar lookup).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sendOtp } from '../server/utils/kavenegar'

describe('sendOtp delivery mode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.KAVENEGAR_API_KEY
  })

  it('returns dev mode and skips the SMS API when no Kavenegar key is set', async () => {
    delete process.env.KAVENEGAR_API_KEY
    const fetchMock = vi.fn()
    vi.stubGlobal('$fetch', fetchMock)

    const mode = await sendOtp('09120000000', '12345')

    expect(mode).toBe('dev')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns sms mode and calls the Kavenegar lookup API when a key is set', async () => {
    process.env.KAVENEGAR_API_KEY = 'test-key'
    const fetchMock = vi.fn().mockResolvedValue({ return: { status: 200, message: 'sent' } })
    vi.stubGlobal('$fetch', fetchMock)

    const mode = await sendOtp('09120000000', '12345')

    expect(mode).toBe('sms')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]!
    expect(String(url)).toContain('api.kavenegar.com/v1/test-key/verify/lookup.json')
    expect(options.query).toMatchObject({ receptor: '09120000000', token: '12345', template: 'orderverify' })
  })

  it('throws when Kavenegar reports a non-200 status', async () => {
    process.env.KAVENEGAR_API_KEY = 'test-key'
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({ return: { status: 400, message: 'bad' } }))
    vi.stubGlobal('createError', (opts: { statusCode: number; statusMessage: string }) => {
      const err = new Error(opts.statusMessage) as Error & { statusCode: number }
      err.statusCode = opts.statusCode
      throw err
    })

    await expect(sendOtp('09120000000', '12345')).rejects.toThrow('ارسال پیامک ناموفق بود')
  })
})
