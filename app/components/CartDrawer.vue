<script setup lang="ts">
import { useCartStore } from '~/stores/cartStore'
import { useCartDrawer } from '~/composables/useCartDrawer'
import { formatToman } from '~/utils/formatToman'

const cart = useCartStore()
const { isOpen, close } = useCartDrawer()
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-ink/30 backdrop-blur-sm" @click="close"></div>

      <aside class="absolute left-0 top-0 flex h-full w-full max-w-sm flex-col border-r border-silver/70 bg-paper shadow-2xl">
        <div class="flex items-center justify-between border-b border-silver/70 px-5 py-4">
          <h2 class="flex items-center gap-2 font-serif text-xl font-bold text-ink">
            <span aria-hidden="true" class="text-ice-500">✦</span>
            سبد خرید
          </h2>
          <button class="text-ink-400 transition-colors hover:text-ink" aria-label="بستن سبد خرید" @click="close">بستن</button>
        </div>

        <div class="flex-1 overflow-y-auto p-5">
          <p v-if="cart.items.length === 0" class="flex flex-col items-center py-16 text-center">
            <span aria-hidden="true" class="font-serif text-3xl text-ice-500/60">✦</span>
            <span class="mt-3 text-ink-400">سبد خرید خالی است.</span>
          </p>

          <ul v-else class="space-y-4">
            <li
              v-for="item in cart.items"
              :key="`${item.itemType}-${item.itemId}-${item.variantId}`"
              class="flex items-start justify-between gap-3 border-b border-silver/60 pb-4"
            >
              <div>
                <p class="text-sm font-medium text-ink">{{ item.nameFa }}</p>
                <p v-if="item.variantLabel" class="mt-0.5 text-xs text-ink-400">{{ item.variantLabel }}</p>
                <p class="mt-1 text-xs text-ink-500">{{ formatToman(item.priceToman) }}</p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-full border border-silver/90 text-sm text-ink-400 transition-colors hover:border-clay hover:text-clay"
                  @click="cart.updateQuantity(item.itemType, item.itemId, item.variantId, item.quantity - 1)"
                >
                  −
                </button>
                <span class="min-w-5 text-center text-sm text-ink">{{ item.quantity }}</span>
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-full border border-silver/90 text-sm text-ink-400 transition-colors hover:border-clay hover:text-clay"
                  @click="cart.updateQuantity(item.itemType, item.itemId, item.variantId, item.quantity + 1)"
                >
                  +
                </button>
                <button
                  class="mr-1 text-xs text-clay/80 transition-colors hover:text-clay"
                  @click="cart.removeItem(item.itemType, item.itemId, item.variantId)"
                >
                  حذف
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="cart.items.length" class="border-t border-silver/70 p-5">
          <p class="flex justify-between font-medium text-ink">
            <span>جمع کل</span>
            <span class="text-clay">{{ formatToman(cart.totalToman) }}</span>
          </p>
          <NuxtLink
            to="/checkout"
            class="mt-4 block rounded-full bg-clay py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-clay-400"
            @click="close"
          >
            ثبت سفارش
          </NuxtLink>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
