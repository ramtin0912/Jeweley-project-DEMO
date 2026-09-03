// story: e01s01

/**
 * @file brand.spec
 * @description Brand-identity copy contract: the EvTag (اِوتاگ) strings every
 * surface imports from app/utils/brand.ts. Changing these values changes the
 * storefront identity — update this test together with the constants.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { describe, it, expect } from 'vitest'
import {
  BRAND_NAME_FA,
  BRAND_NAME_EN,
  BRAND_ENGRAVED_EN,
  BRAND_TAGLINE_FA,
  BRAND_DOCUMENT_TITLE,
  BRAND_DOCUMENT_DESCRIPTION,
} from '../app/utils/brand'

describe('brand identity — EvTag (اِوتاگ), one of a kind (یکتا)', () => {
  it('exposes the Persian wordmark', () => {
    expect(BRAND_NAME_FA).toBe('اِوتاگ')
  })

  it('exposes the Latin brand name', () => {
    expect(BRAND_NAME_EN).toBe('EvTag')
  })

  it('exposes the engraved Latin identity line', () => {
    expect(BRAND_ENGRAVED_EN).toBe('EvTag — one of a kind')
  })

  it('exposes the Persian tagline', () => {
    expect(BRAND_TAGLINE_FA).toBe('یکتا')
  })

  it('exposes a brand-first document title', () => {
    expect(BRAND_DOCUMENT_TITLE).toBe('اِوتاگ — زیورآلات نقرهٔ دست\u200cساز')
  })

  it('exposes a brand-aware document description', () => {
    expect(BRAND_DOCUMENT_DESCRIPTION).toBe(
      'فروشگاه اِوتاگ؛ زیورآلات نقرهٔ دست\u200cساز — هر قطعه یکتا (EvTag, one of a kind)'
    )
  })
})
