<script setup lang="ts">
import { BRAND_NAME_FA, BRAND_ENGRAVED_EN } from '~/utils/brand'

useSeoMeta({
  title: `${BRAND_NAME_FA} | زیورآلات نقرهٔ دست\u200cساز با کریستال`,
  description: `فروشگاه ${BRAND_NAME_FA}؛ زیورآلات نقرهٔ دست\u200cساز با سنگ کریستال — هر قطعه یکتا (EvTag, one of a kind)`
})

const { data } = useShopData()
const categories = computed(() => data.value.categories)
const products = computed(() => data.value.products)

const selectedCategory = ref<string | null>(null)
const searchQuery = ref('')
const inStockOnly = ref(false)

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value) {
    list = list.filter((product) => product.category?.slug === selectedCategory.value)
  }
  if (inStockOnly.value) {
    list = list.filter((product) => product.stockCount > 0)
  }
  const query = searchQuery.value.trim()
  if (query) {
    list = list.filter(
      (product) => product.nameFa.includes(query) || (product.descriptionFa ?? '').includes(query)
    )
  }
  return list
})

function selectCategory(slug: string | null) {
  selectedCategory.value = slug
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative flex flex-col items-center overflow-hidden px-4 py-20 text-center sm:py-28">
      <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="crescent-moon -top-24 right-[4%] opacity-90"></div>
        <div class="sparkle-field absolute inset-0"></div>
      </div>

      <p dir="ltr" class="reveal relative z-10 font-engraved text-[11px] font-semibold uppercase tracking-[0.42em] text-silver-700">
        {{ BRAND_ENGRAVED_EN }}
      </p>

      <h1 class="reveal relative z-10 mt-6 max-w-3xl font-serif text-5xl font-bold leading-[1.2] text-ink sm:text-7xl" style="animation-delay: 90ms">
        نِگین و نقره، زیرِ نورِ ماه
      </h1>

      <p class="reveal relative z-10 mt-6 max-w-xl leading-relaxed text-ink-400" style="animation-delay: 180ms">
        زیورآلات نقرهٔ دست‌ساز با سنگِ کریستال — هر قطعه با حوصله ساخته می‌شود و ماه و ستاره
        را در دلِ خود دارد.
      </p>

      <div class="reveal relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4" style="animation-delay: 270ms">
        <a href="#catalog" class="btn-primary">مشاهده مجموعه</a>
        <NuxtLink to="/portfolio" class="btn-ghost">نمونه‌کارها</NuxtLink>
      </div>

      <div class="reveal relative z-10 mt-14 flex items-center gap-3 text-ice-500" style="animation-delay: 360ms">
        <span class="h-px w-16 bg-silver/80"></span>
        <span aria-hidden="true">✦</span>
        <span class="h-px w-16 bg-silver/80"></span>
      </div>
    </section>

    <!-- Catalog -->
    <section id="catalog" class="scroll-mt-24 border-t border-silver/70 pt-12">
      <div class="flex items-center justify-between gap-4">
        <h2 class="font-serif text-3xl font-bold text-ink sm:text-4xl">مجموعه</h2>
        <span class="h-px flex-1 bg-silver/70"></span>
      </div>

      <!-- Filters -->
      <div class="mt-6 flex flex-wrap items-center gap-2">
        <button
          class="rounded-full px-4 py-1.5 text-sm transition-colors duration-300"
          :class="selectedCategory === null ? 'bg-clay text-white' : 'border border-silver/90 bg-white text-ink-400 hover:border-clay hover:text-clay'"
          @click="selectCategory(null)"
        >
          همه
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="rounded-full px-4 py-1.5 text-sm transition-colors duration-300"
          :class="selectedCategory === category.slug ? 'bg-clay text-white' : 'border border-silver/90 bg-white text-ink-400 hover:border-clay hover:text-clay'"
          @click="selectCategory(category.slug)"
        >
          {{ category.nameFa }}
        </button>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="جستجو..."
          class="w-full max-w-xs rounded-full border border-silver/80 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-400 focus:border-ice-500 focus:outline-none focus:ring-1 focus:ring-ice-500/50"
        />
        <label class="flex cursor-pointer items-center gap-2 text-sm text-ink-400">
          <input v-model="inStockOnly" type="checkbox" class="h-4 w-4 accent-ice-500" />
          فقط موجود
        </label>
      </div>

      <!-- Grid -->
      <div v-if="filteredProducts.length" class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        <ProductCard
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          :product="product"
          class="reveal"
          :style="{ animationDelay: `${Math.min(index, 7) * 60}ms` }"
        />
      </div>

      <div v-else class="mt-16 flex flex-col items-center gap-3 py-8 text-center">
        <span aria-hidden="true" class="font-serif text-3xl text-ice-500/60">✦</span>
        <p class="text-ink-400">محصولی یافت نشد.</p>
      </div>
    </section>
  </div>
</template>
