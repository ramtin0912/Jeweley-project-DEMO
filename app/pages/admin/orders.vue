<script setup lang="ts">
import { formatToman, toPersianDigits } from '~/utils/formatToman'
import { toShamsiDate } from '~/utils/shamsiDate'
import { ORDER_STATUS_LABELS, orderStatusBadgeClass } from '~/utils/orderStatus'

definePageMeta({ layout: 'admin' })

const runtime = useRuntimeConfig()
// Static demo = per-browser sandbox (editable locally). Full-stack demo = read-only.
const canEdit = runtime.public.staticMode === true || runtime.public.demo === false

const { orders, statusBreakdown, updateOrderStatus } = useAdminDerived()

const statusFilter = ref('')
const filtered = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter((o) => o.status === statusFilter.value)
})

function updateStatus(orderId: number, status: string) {
  updateOrderStatus(orderId, status)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">سفارش‌ها</h1>

    <h2 class="mt-8 flex items-center gap-2 text-lg font-semibold">
      <span aria-hidden="true" class="text-ice-500">✦</span>
      وضعیت سفارش‌ها
    </h2>
    <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <div v-for="row in statusBreakdown" :key="row.status" class="mbx-panel text-center">
        <span :class="['inline-block rounded-full px-3 py-1 text-xs font-medium', orderStatusBadgeClass(row.status)]">
          {{ row.label }}
        </span>
        <p class="mt-3 text-2xl font-bold">{{ toPersianDigits(row.count) }}</p>
        <p class="mt-1 text-xs text-neutral-500">مبلغ {{ formatToman(row.revenue) }}</p>
      </div>
    </div>

    <div class="mt-6 flex items-center gap-2">
      <span class="text-sm text-neutral-500">فیلتر وضعیت:</span>
      <select v-model="statusFilter" class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm">
        <option value="">همه</option>
        <option v-for="(label, key) in ORDER_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <div class="mt-4 space-y-3">
      <div v-for="order in filtered" :key="order.id" class="rounded-lg border border-neutral-200 bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span :class="['inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', orderStatusBadgeClass(order.status)]">
              {{ ORDER_STATUS_LABELS[order.status] ?? order.status }}
            </span>
            <p class="mt-1.5 font-medium">{{ order.orderNumber }}</p>
            <p class="text-sm text-neutral-500">{{ order.customerName }} · {{ order.customerPhone }}</p>
            <p class="mt-1 text-sm text-neutral-600">{{ order.province }}، {{ order.city }} — {{ order.address }}</p>
          </div>
          <div class="text-left">
            <p class="font-medium text-accent-dark">{{ formatToman(order.totalToman) }}</p>
            <p class="text-xs text-neutral-500">{{ toShamsiDate(order.createdAt) }}</p>
          </div>
        </div>

        <div class="mt-3 border-t border-neutral-100 pt-3">
          <p class="mb-1 text-sm font-medium">اقلام:</p>
          <ul class="text-sm text-neutral-600">
            <li v-for="item in order.items" :key="item.id">
              {{ item.nameFa }} <span v-if="item.variantLabel">({{ item.variantLabel }})</span> × {{ item.quantity }} — {{ formatToman(item.priceToman) }}
            </li>
          </ul>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <span class="text-sm">وضعیت:</span>
          <select :value="order.status" :disabled="!canEdit" class="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-60" @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)">
            <option v-for="(label, key) in ORDER_STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
      </div>

      <p v-if="!filtered.length" class="rounded-lg border border-neutral-200 bg-white p-6 text-center text-neutral-500">
        سفارشی یافت نشد.
      </p>
    </div>
  </div>
</template>
