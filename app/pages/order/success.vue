<script setup lang="ts">
// story: e02s02
import { BRAND_NAME_FA, BRAND_NAME_EN } from '~/utils/brand'

const route = useRoute()
const orderNumber = (route.query.orderNumber as string) ?? ''
// Buyer's given name from the order (demo redirect carries it; used in the SMS preview).
const customerName = typeof route.query.name === 'string' ? route.query.name : ''
const greeting = customerName ? `${customerName} عزیز` : 'مشتری گرامی'
</script>

<template>
  <div class="mx-auto max-w-md py-16">
    <div class="rounded-2xl border border-silver/70 bg-white p-8 text-center">
      <span aria-hidden="true" class="font-serif text-4xl text-ice-500">✦</span>
      <h1 class="mt-4 font-serif text-3xl font-bold text-ink">پرداخت موفق</h1>
      <p class="mt-2 text-ink-400">سفارش شما با موفقیت ثبت و پرداخت شد.</p>
      <p v-if="orderNumber" class="mt-2 text-ink-500" dir="ltr">شماره سفارش: {{ orderNumber }}</p>
      <NuxtLink to="/" class="btn-primary mt-6">بازگشت به فروشگاه</NuxtLink>
    </div>

    <!-- Demo placeholder — the real receipt SMS is sent once SMS is wired to the gateway -->
    <div class="mt-6 rounded-2xl border border-dashed border-silver/80 bg-paper-50 p-5">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs font-semibold text-ink-500">نمونهٔ پیامک رسید (نسخهٔ نمایشی)</p>
        <span class="rounded-full border border-silver/70 px-2 py-0.5 text-[10px] text-silver-700">DEMO</span>
      </div>
      <div class="mt-4 rounded-2xl rounded-tr-sm border border-silver/70 bg-white p-4 text-right">
        <p class="text-[11px] text-ice-700">پیامک از {{ BRAND_NAME_FA }} ({{ BRAND_NAME_EN }})</p>
        <p class="mt-2 text-sm leading-relaxed text-ink">
          {{ greeting }}، سفارش شما با موفقیت ثبت و پرداخت شد.
          <span v-if="orderNumber">شماره پیگیری: {{ orderNumber }}.</span>
          سفارش در حال آماده‌سازی است و هماهنگی ارسال از طریق همین شماره انجام می‌شود.
          با تشکر از خرید شما — هر قطعه، یکتا. ✦
        </p>
      </div>
      <p class="mt-3 text-[11px] leading-relaxed text-ink-400">
        در نسخهٔ نهایی، پس از پرداخت واقعی، پیامک مشابه این نمونه برای خریدار ارسال می‌شود.
      </p>
    </div>
  </div>
</template>
