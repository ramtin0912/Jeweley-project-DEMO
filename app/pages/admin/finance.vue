<script setup lang="ts">
// story: e03s01

import type { Finance } from '~/types/admin'
import { formatToman, toPersianDigits } from '~/utils/formatToman'

definePageMeta({ layout: 'admin' })

const MONTH_PER_PAGE = 12
const monthPage = ref(1)

const { finance } = useAdminDerived()
const data = computed(() => finance(monthPage.value, MONTH_PER_PAGE))

const totalPages = computed(() =>
  Math.max(1, Math.ceil((data.value?.monthTotal ?? 1) / MONTH_PER_PAGE))
)

function goToMonthPage(page: number) {
  monthPage.value = Math.min(Math.max(1, page), totalPages.value)
}

const maxMonthlyRevenue = computed(() =>
  Math.max(1, ...(data.value?.monthly ?? []).map((m) => m.revenue))
)

function barWidth(revenue: number): string {
  return `${(revenue / maxMonthlyRevenue.value) * 100}%`
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <h1 class="font-serif text-3xl font-bold text-neutral-900">امور مالی</h1>
      <span class="h-px flex-1 bg-neutral-200"></span>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="mbx-panel">
        <p class="text-sm text-neutral-500">درآمد امروز</p>
        <p class="mt-2 text-2xl font-bold text-clay">{{ formatToman(data?.totals.todayRevenue ?? 0) }}</p>
      </div>
      <div class="mbx-panel">
        <p class="text-sm text-neutral-500">درآمد این ماه</p>
        <p class="mt-2 text-2xl font-bold text-clay">{{ formatToman(data?.totals.thisMonthRevenue ?? 0) }}</p>
      </div>
      <div class="mbx-panel border-clay/40 bg-clay/5">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm text-neutral-600">درآمد ماه گذشته</p>
          <span class="rounded-full bg-clay px-2 py-0.5 text-xs font-medium text-white">ماه قبل</span>
        </div>
        <p class="mt-2 text-2xl font-bold text-clay">{{ formatToman(data?.totals.lastMonthRevenue ?? 0) }}</p>
      </div>
      <div class="mbx-panel">
        <p class="text-sm text-neutral-500">تعداد فروش این ماه</p>
        <p class="mt-2 text-2xl font-bold">{{ toPersianDigits(data?.totals.thisMonthOrderCount ?? 0) }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <div class="mbx-panel">
        <p class="text-sm text-neutral-500">سفارش‌های پرداخت‌شده</p>
        <p class="mt-2 text-2xl font-bold">{{ toPersianDigits(data?.totals.orderCount ?? 0) }}</p>
      </div>
      <div class="mbx-panel">
        <p class="text-sm text-neutral-500">میانگین ارزش سفارش</p>
        <p class="mt-2 text-2xl font-bold">{{ formatToman(data?.totals.avgOrderValue ?? 0) }}</p>
      </div>
    </div>

    <h2 class="mt-8 flex items-center gap-2 text-lg font-semibold">
      <span aria-hidden="true" class="text-ice-500">✦</span>
      روند درآمد
    </h2>
    <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-neutral-500">صفحه {{ toPersianDigits(monthPage) }} از {{ toPersianDigits(totalPages) }}</p>
      <div class="flex gap-2">
        <button
          class="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-600 transition-colors hover:border-clay hover:text-clay disabled:pointer-events-none disabled:opacity-40"
          :disabled="monthPage <= 1"
          @click="goToMonthPage(monthPage - 1)"
        >
          ماه‌های جدیدتر
        </button>
        <button
          class="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-600 transition-colors hover:border-clay hover:text-clay disabled:pointer-events-none disabled:opacity-40"
          :disabled="monthPage >= totalPages"
          @click="goToMonthPage(monthPage + 1)"
        >
          ماه‌های قدیمی‌تر
        </button>
      </div>
    </div>
    <div class="mbx-panel mt-3 overflow-x-auto p-0">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-200 text-right">
            <th class="p-3 font-medium text-neutral-500">ماه</th>
            <th class="p-3 font-medium text-neutral-500">سفارش</th>
            <th class="p-3 font-medium text-neutral-500">درآمد</th>
            <th class="p-3 font-medium text-neutral-500">نمودار</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in data?.monthly ?? []" :key="`${m.year}-${m.month}`" class="border-b border-neutral-100 last:border-0">
            <td class="p-3">{{ m.label }} {{ toPersianDigits(m.year) }}</td>
            <td class="p-3">{{ toPersianDigits(m.orderCount) }}</td>
            <td class="p-3 text-clay">{{ formatToman(m.revenue) }}</td>
            <td class="p-3">
              <div class="h-2.5 w-40 overflow-hidden rounded-full bg-neutral-100">
                <div class="h-full rounded-full bg-clay" :style="{ width: barWidth(m.revenue) }"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2 class="mt-8 flex items-center gap-2 text-lg font-semibold">
      <span aria-hidden="true" class="text-ice-500">✦</span>
      پرفروش‌ترین محصولات
    </h2>
    <div class="mbx-panel mt-3 overflow-x-auto p-0">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-200 text-right">
            <th class="p-3 font-medium text-neutral-500">محصول</th>
            <th class="p-3 font-medium text-neutral-500">تعداد</th>
            <th class="p-3 font-medium text-neutral-500">درآمد</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data?.perProduct ?? []" :key="item.nameFa" class="border-b border-neutral-100 last:border-0">
            <td class="p-3">{{ item.nameFa }}</td>
            <td class="p-3">{{ toPersianDigits(item.quantity) }}</td>
            <td class="p-3 text-clay">{{ formatToman(item.revenue) }}</td>
          </tr>
          <tr v-if="!data?.perProduct?.length">
            <td colspan="3" class="p-3 text-center text-neutral-500">هنوز فروشی ثبت نشده است.</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
