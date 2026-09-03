<script setup lang="ts">
import type { Package } from '~/types/catalog'
import { formatToman } from '~/utils/formatToman'
import { useCartStore } from '~/stores/cartStore'
import { useCartDrawer } from '~/composables/useCartDrawer'

useSeoMeta({
  title: 'پکیج‌ها',
  description: 'پکیج‌های چند محصولی با قیمت ثابت.'
})

const { data } = useShopData()
const packages = computed(() => data.value.packages)
const cart = useCartStore()
const { open } = useCartDrawer()

const failedImages = reactive<Record<number, boolean>>({})

function addPackage(pkg: Package) {
  if (pkg.stockCount <= 0) return
  cart.addItem({
    itemType: 'package',
    itemId: pkg.id,
    nameFa: pkg.nameFa,
    priceToman: pkg.priceToman,
    quantity: 1,
    image: pkg.image,
    slug: pkg.slug,
    variantId: null,
    variantLabel: null
  })
  open()
}
</script>

<template>
  <div>
    <p dir="ltr" class="font-engraved text-[11px] font-semibold uppercase tracking-[0.42em] text-silver-700">
      Curated Sets
    </p>
    <div class="mt-3 flex items-center gap-4">
      <h1 class="font-serif text-4xl font-bold text-ink sm:text-5xl">پکیج‌ها</h1>
      <span class="h-px flex-1 bg-silver/70"></span>
    </div>
    <p class="mt-3 max-w-xl text-ink-400">چند محصول هماهنگ در یک بسته، با قیمت ثابت.</p>

    <div class="mt-8 grid gap-6 md:grid-cols-2">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="reveal flex flex-col overflow-hidden rounded-2xl border border-silver/70 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-ice-500/70 hover:shadow-[0_18px_40px_-18px_rgba(93,147,161,0.4)]"
      >
        <div class="relative aspect-[16/10] overflow-hidden bg-paper-100">
          <img
            v-if="pkg.image && !failedImages[pkg.id]"
            :src="pkg.image"
            :alt="pkg.nameFa"
            class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            @error="failedImages[pkg.id] = true"
          />
          <span v-else class="absolute inset-0 flex items-center justify-center font-serif text-6xl text-silver-700/50">
            {{ pkg.nameFa.charAt(0) }}
          </span>
          <div aria-hidden="true" class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-silver/40"></div>
        </div>

        <div class="flex flex-1 flex-col p-6">
        <div class="flex items-start justify-between gap-4">
          <h2 class="font-serif text-2xl font-bold text-ink">{{ pkg.nameFa }}</h2>
          <span v-if="pkg.stockCount <= 0" class="rounded-full border border-silver/70 px-2 py-0.5 text-[11px] text-ink-400">ناموجود</span>
        </div>
        <p class="mt-2 text-sm leading-relaxed text-ink-400">{{ pkg.descriptionFa }}</p>

        <ul class="mt-5 space-y-2 border-t border-silver/60 pt-5 text-sm text-ink-400">
          <li v-for="item in pkg.items" :key="item.id" class="flex items-center gap-2.5">
            <span aria-hidden="true" class="text-ice-500">✦</span>
            {{ item.product.nameFa }}
            <span v-if="item.variant" class="text-ink-400">({{ item.variant.value }})</span>
            <span class="mr-auto text-ink-400">× {{ item.quantity }}</span>
          </li>
        </ul>

        <div class="mt-auto flex items-center justify-between border-t border-silver/60 pt-5">
          <p class="text-xl font-medium text-ink-500">{{ formatToman(pkg.priceToman) }}</p>
          <button
            v-if="pkg.stockCount > 0"
            class="rounded-full border border-silver/90 px-6 py-2.5 text-sm font-medium text-ink transition-all duration-300 hover:border-clay hover:bg-clay hover:text-white"
            @click="addPackage(pkg)"
          >
            افزودن به سبد
          </button>
        </div>
        </div>
      </div>

      <p v-if="!packages?.length" class="text-ink-400">پکیجی ثبت نشده است.</p>
    </div>
  </div>
</template>
