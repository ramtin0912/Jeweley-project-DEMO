/**
 * @file order
 * @description Cart and order types shared between storefront components.
 *
 * @status None
 * @issues None
 * @todo None
 */

export interface CartItem {
  itemType: 'product' | 'package'
  itemId: number
  nameFa: string
  priceToman: number
  quantity: number
  image: string | null
  slug: string
  variantId?: number | null
  variantLabel?: string | null
}

export interface OrderItemPayload {
  itemType: 'product' | 'package'
  itemId: number
  quantity: number
  variantId?: number
}

export interface OrderResult {
  orderNumber: string
  totalToman: number
  redirectUrl?: string
}
