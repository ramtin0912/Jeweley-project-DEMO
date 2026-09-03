// story: e01s01

/**
 * @file brand
 * @description Single source of truth for the EvTag (اِوتاگ) brand identity.
 * Every brand-visible surface imports these constants so the wordmark, Latin
 * line, tagline, and document metadata cannot drift apart. Pure constants —
 * no Nuxt runtime imports — so nuxt.config.ts can import this at build time
 * and Vitest can test it standalone.
 *
 * Brand: EvTag (اِوتاگ) — "one of a kind" / یکتا
 *
 * @status None
 * @issues None
 * @todo None
 */

export const BRAND_NAME_FA = 'اِوتاگ'
export const BRAND_NAME_EN = 'EvTag'
/** Engraved Latin identity line (LTR, font-engraved treatment). */
export const BRAND_ENGRAVED_EN = 'EvTag — one of a kind'
/** Persian tagline: یکتا = one of a kind. */
export const BRAND_TAGLINE_FA = 'یکتا'

export const BRAND_DOCUMENT_TITLE = 'اِوتاگ — زیورآلات نقرهٔ دست\u200cساز'
export const BRAND_DOCUMENT_DESCRIPTION =
  'فروشگاه اِوتاگ؛ زیورآلات نقرهٔ دست\u200cساز — هر قطعه یکتا (EvTag, one of a kind)'
