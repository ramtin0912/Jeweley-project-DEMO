<script setup lang="ts">
import type { Product } from '~/types/catalog'
import { formatToman } from '~/utils/formatToman'
import { useCartStore } from '~/stores/cartStore'
import { useCartDrawer } from '~/composables/useCartDrawer'

const props = defineProps<{ product: Product }>()
const cart = useCartStore()
const { open } = useCartDrawer()

const imageFailed = ref(false)

function addToCart() {
  if (props.product.stockCount <= 0) return
  cart.addItem({
    itemType: 'product',
    itemId: props.product.id,
    nameFa: props.product.nameFa,
    priceToman: props.product.priceToman,
    quantity: 1,
    image: props.product.image,
    slug: props.product.slug,
    variantId: null,
    variantLabel: null
  })
  open()
}
</script>

<template>
  <div
    class="group flex flex-col overflow-hidden rounded-2xl border border-silver/70 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-ice-500/70 hover:shadow-[0_18px_40px_-18px_rgba(93,147,161,0.4)]"
  >
    <NuxtLink :to="`/products/${product.slug}`" class="flex flex-1 flex-col">
      <div class="relative aspect-square overflow-hidden bg-paper-100">
        <img
          v-if="product.image && !imageFailed"
          :src="product.image"
          :alt="product.nameFa"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          @error="imageFailed = true"
        />
        <span v-else class="absolute inset-0 flex items-center justify-center font-serif text-6xl text-silver-700/50">
          {{ product.nameFa.charAt(0) }}
        </span>

        <div aria-hidden="true" class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-silver/40"></div>

        <span
          v-if="product.stockCount === 0"
          class="absolute right-3 top-3 rounded-full border border-silver/70 bg-white/90 px-2.5 py-1 text-[11px] text-ink-400 backdrop-blur-sm"
        >
          ناموجود
        </span>
        <span
          v-else-if="product.isExclusive"
          class="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ice px-2.5 py-1 text-[11px] font-bold text-ink"
        >
          <span aria-hidden="true">✦</span>
          اختصاصی
        </span>
      </div>

      <div class="flex flex-1 flex-col p-4">
        <p v-if="product.category" class="text-[11px] text-ink-400">{{ product.category.nameFa }}</p>
        <h3 class="mt-1.5 font-serif text-xl leading-snug text-ink transition-colors duration-300 group-hover:text-clay">
          {{ product.nameFa }}
        </h3>
        <p class="mt-2 font-medium text-ink-500">{{ formatToman(product.priceToman) }}</p>
      </div>
    </NuxtLink>

    <div class="px-4 pb-4">
      <button
        v-if="product.stockCount > 0"
        class="w-full rounded-full border border-silver/90 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-clay hover:bg-clay hover:text-white"
        @click="addToCart"
      >
        افزودن به سبد
      </button>
      <button v-else disabled class="w-full cursor-not-allowed rounded-full border border-silver/70 py-2.5 text-sm text-ink-400">
        ناموجود
      </button>
    </div>
  </div>
</template>
