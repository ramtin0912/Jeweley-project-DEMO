/**
 * @file cartStore
 * @description Pinia cart store persisted to localStorage (guest cart).
 *
 * @status None
 * @issues None
 * @todo None
 */
import { defineStore } from 'pinia'
import type { CartItem } from '~/types/order'

const STORAGE_KEY = 'jewelry-cart'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  if (import.meta.client) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        items.value = JSON.parse(raw) as CartItem[]
      }
    } catch {
      // Ignore corrupted cart data.
    }
  }

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const totalToman = computed(() => items.value.reduce((sum, item) => sum + item.priceToman * item.quantity, 0))

  function persist() {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    }
  }

  function addItem(item: CartItem) {
    const existing = items.value.find(
      (i) => i.itemType === item.itemType && i.itemId === item.itemId && i.variantId === item.variantId
    )
    if (existing) {
      existing.quantity += item.quantity
    } else {
      items.value.push(item)
    }
    persist()
  }

  function updateQuantity(itemType: string, itemId: number, variantId: number | null | undefined, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemType, itemId, variantId)
      return
    }
    const item = items.value.find(
      (i) => i.itemType === itemType && i.itemId === itemId && i.variantId === variantId
    )
    if (item) {
      item.quantity = quantity
      persist()
    }
  }

  function removeItem(itemType: string, itemId: number, variantId?: number | null) {
    items.value = items.value.filter(
      (item) => !(item.itemType === itemType && item.itemId === itemId && item.variantId === variantId)
    )
    persist()
  }

  function clear() {
    items.value = []
    persist()
  }

  return { items, itemCount, totalToman, addItem, updateQuantity, removeItem, clear }
})
