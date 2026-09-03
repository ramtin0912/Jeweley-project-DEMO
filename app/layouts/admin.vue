<script setup lang="ts">
import { BRAND_NAME_FA } from '~/utils/brand'

const runtime = useRuntimeConfig()
// Static (GitHub Pages) demo has no server/session: the read-only admin is
// auto-authenticated from the baked snapshot, so skip the auth check and make
// logout purely client-side.
const isStatic = computed(() => runtime.public.staticMode === true)
const shop = useShopData()

const checking = ref(true)

onMounted(async () => {
  if (isStatic.value) {
    checking.value = false
    return
  }
  try {
    await $fetch('/api/admin/auth/me')
  } catch {
    navigateTo('/admin/login')
  } finally {
    checking.value = false
  }
})

async function logout() {
  if (isStatic.value) {
    navigateTo('/')
    return
  }
  await $fetch('/api/admin/auth/logout', { method: 'POST' })
  navigateTo('/admin/login')
}

const links = [
  { to: '/admin', label: 'داشبورد' },
  { to: '/admin/finance', label: 'امور مالی' },
  { to: '/admin/products', label: 'محصولات' },
  { to: '/admin/packages', label: 'پکیج‌ها' },
  { to: '/admin/portfolio', label: 'نمونه‌کارها' },
  { to: '/admin/posts', label: 'وبلاگ' },
  { to: '/admin/orders', label: 'سفارش‌ها' }
]
</script>

<template>
  <div dir="rtl" class="min-h-screen bg-neutral-100 text-neutral-900">
    <DemoBanner
      :label="isStatic ? 'پنل مدیریت — سندباکس (تغییرات فقط در مرورگر شما)' : 'پنل مدیریت — دمو (فقط‌خواندنی)'"
      :show-link="true"
      link-to="/"
      link-label="بازگشت به فروشگاه"
    />

    <div v-if="isStatic" class="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-800">
      <span>حالت سندباکس: هر تغییری فقط در مرورگر شما ذخیره می‌شود و دیگران را تحت تأثیر قرار نمی‌دهد.</span>
      <button
        type="button"
        class="ml-2 underline decoration-dotted underline-offset-2 hover:text-amber-900"
        @click="shop.resetDemo()"
      >
        بازنشانی به دادهٔ اصلی
      </button>
    </div>

    <header class="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div class="flex flex-wrap items-center gap-6">
          <NuxtLink to="/admin" class="flex items-center gap-2 font-serif text-lg font-bold">
            <span aria-hidden="true" class="text-clay">✦</span>
            مدیریت {{ BRAND_NAME_FA }}
          </NuxtLink>
          <nav class="flex gap-2 text-sm">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="rounded-full px-3.5 py-1.5 text-neutral-600 transition-colors duration-300 hover:bg-neutral-100 hover:text-neutral-900"
              active-class="bg-clay text-white hover:bg-clay hover:text-white"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
        <button class="rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:border-red-300 hover:text-red-600" @click="logout">
          خروج
        </button>
      </div>
    </header>

    <main v-if="!checking" class="mx-auto max-w-6xl px-6 py-8">
      <slot />
    </main>
    <p v-else class="p-10 text-center text-neutral-500">در حال بارگذاری...</p>
  </div>
</template>
