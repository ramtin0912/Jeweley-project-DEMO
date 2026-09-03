<script setup lang="ts">
import { useCartStore } from '~/stores/cartStore'
import { useCartDrawer } from '~/composables/useCartDrawer'
import { BRAND_NAME_FA, BRAND_ENGRAVED_EN } from '~/utils/brand'

const cart = useCartStore()
const { toggle } = useCartDrawer()

const navLinks = [
  { to: '/', label: 'فروشگاه' },
  { to: '/packages', label: 'پکیج‌ها' },
  { to: '/portfolio', label: 'نمونه‌کارها' },
  { to: '/blog', label: 'وبلاگ' }
]
</script>

<template>
  <div class="atelier-root moon-sky relative min-h-screen overflow-x-clip bg-paper text-ink">
    <DemoBanner
      :show-link="true"
      link-to="/admin"
      link-label="ورود به پنل مدیریت"
    />

    <header class="sticky top-0 z-40 border-b border-silver/70 bg-paper/85 backdrop-blur-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <NuxtLink to="/" class="group flex flex-col leading-none">
          <span class="flex items-center gap-2 font-serif text-2xl font-bold text-ink">
            <span aria-hidden="true" class="text-ice-500">✦</span>
            {{ BRAND_NAME_FA }}
          </span>
          <span dir="ltr" class="mt-1.5 self-start font-engraved text-[10px] font-semibold uppercase tracking-[0.34em] text-silver-700">
            {{ BRAND_ENGRAVED_EN }}
          </span>
        </NuxtLink>

        <nav class="hidden items-center gap-8 text-sm md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="relative py-1 text-ink-400 transition-colors duration-300 after:absolute after:-bottom-0.5 after:right-0 after:h-px after:w-0 after:bg-clay after:transition-all after:duration-300 hover:text-ink hover:after:w-full"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <button
          class="relative flex h-11 w-11 items-center justify-center rounded-full border border-silver/90 bg-white text-ink transition-colors duration-300 hover:border-clay hover:text-clay"
          aria-label="باز کردن سبد خرید"
          @click="toggle"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 7h12l1.2 13.2a1 1 0 0 1-1 1.1H5.8a1 1 0 0 1-1-1.1L6 7Z" />
            <path d="M9 10V6a3 3 0 0 1 6 0v4" />
          </svg>
          <span
            v-if="cart.itemCount"
            class="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[11px] font-bold text-white"
          >
            {{ cart.itemCount }}
          </span>
        </button>
      </div>

      <nav class="flex items-center gap-6 overflow-x-auto border-t border-silver/60 px-4 py-3 text-sm md:hidden sm:px-6">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="shrink-0 text-ink-400 transition-colors duration-300 hover:text-ink"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </header>

    <main class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <slot />
    </main>

    <footer class="relative border-t border-silver/70 bg-paper/60">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center sm:px-6">
        <p class="flex items-center gap-2 font-serif text-xl font-bold text-ink">
          <span aria-hidden="true" class="text-ice-500">✦</span>
          {{ BRAND_NAME_FA }}
        </p>
        <p dir="ltr" class="font-engraved text-[10px] font-semibold uppercase tracking-[0.34em] text-silver-700">
          {{ BRAND_ENGRAVED_EN }}
        </p>
        <nav class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
          <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" class="transition-colors duration-300 hover:text-clay">
            {{ link.label }}
          </NuxtLink>
        </nav>
        <p class="text-xs text-ink-400">هر قطعه، نقره و کریستال — یکتا، چون دلِ ماه.</p>
      </div>
    </footer>

    <CartDrawer />
  </div>
</template>
