<script setup lang="ts">
import type { PortfolioWork } from '~/types/catalog'

useSeoMeta({
  title: 'نمونه‌کارها',
  description: 'آثار قبلی و سفارشی.'
})

const { data } = useShopData()
const works = computed(() => data.value.portfolio)

const failedImages = reactive<Record<number, boolean>>({})
</script>

<template>
  <div>
    <p dir="ltr" class="font-engraved text-[11px] font-semibold uppercase tracking-[0.42em] text-silver-700">
      Portfolio
    </p>
    <div class="mt-3 flex items-center gap-4">
      <h1 class="font-serif text-4xl font-bold text-ink sm:text-5xl">نمونه‌کارها</h1>
      <span class="h-px flex-1 bg-silver/70"></span>
    </div>
    <p class="mt-3 max-w-xl text-ink-400">آثار قبلی و سفارشی — گواهِ دستانِ سازنده.</p>

    <div class="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
      <figure
        v-for="(work, index) in works"
        :key="work.id"
        class="reveal group mb-6 break-inside-avoid"
        :style="{ animationDelay: `${Math.min(index, 5) * 70}ms` }"
      >
        <div class="relative overflow-hidden rounded-2xl border border-silver/70 bg-paper-100">
          <img
            v-if="work.image && !failedImages[work.id]"
            :src="work.image"
            :alt="work.titleFa"
            class="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            @error="failedImages[work.id] = true"
          />
          <div
            v-else
            class="flex aspect-square w-full items-center justify-center font-serif text-6xl text-silver-700/40"
          >
            {{ work.titleFa.charAt(0) }}
          </div>
          <div aria-hidden="true" class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-silver/40"></div>
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          ></div>
        </div>

        <figcaption class="mt-3.5 px-1">
          <h2 class="font-serif text-xl font-bold text-ink transition-colors duration-300 group-hover:text-clay">
            {{ work.titleFa }}
          </h2>
          <p v-if="work.descriptionFa" class="mt-1.5 text-sm leading-relaxed text-ink-400">{{ work.descriptionFa }}</p>
          <p class="mt-2 text-xs text-ink-400">
            {{ work.material }}
            <span v-if="work.year" class="mx-1.5 text-ice-500">✦</span>
            <span v-if="work.year">{{ work.year }}</span>
          </p>
        </figcaption>
      </figure>

      <p v-if="!works?.length" class="text-ink-400">نمونه‌کاری ثبت نشده است.</p>
    </div>
  </div>
</template>
