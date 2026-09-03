// story: e02s01
<script setup lang="ts">
import { useCartStore } from '~/stores/cartStore'
import { formatToman } from '~/utils/formatToman'
import { getErrorMessage } from '~/utils/getErrorMessage'
import type { OrderResult } from '~/types/order'

const runtime = useRuntimeConfig()
// Static (GitHub Pages) demo has no server/SMS/gateway: OTP + order are simulated locally.
const isStatic = computed(() => runtime.public.staticMode === true)

const cart = useCartStore()

const form = reactive({
  customerName: '',
  phone: '',
  province: '',
  city: '',
  address: '',
  postalCode: ''
})
const otpCode = ref('')
const otpSent = ref(false)
const devCodeFilled = ref(false)
const sending = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const result = ref<OrderResult | null>(null)

async function sendOtp() {
  errorMessage.value = ''

  // Static demo: no SMS gateway — generate a code locally and pre-fill it.
  if (isStatic.value) {
    const code = String(Math.floor(10000 + Math.random() * 90000))
    otpCode.value = code
    devCodeFilled.value = true
    otpSent.value = true
    return
  }

  sending.value = true
  try {
    const response = await $fetch<{ ok: boolean; devCode?: string }>('/api/auth/otp/send', {
      method: 'POST',
      body: { phone: form.phone }
    })
    otpSent.value = true
    // Dev mode only: the API returns the console-logged code so we can fill it in.
    if (response.devCode) {
      otpCode.value = response.devCode
      devCodeFilled.value = true
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    sending.value = false
  }
}

async function submitOrder() {
  errorMessage.value = ''

  // Static demo: simulate order creation locally (no server, no payment).
  if (isStatic.value) {
    const orderNumber = `JS-STATIC-${Date.now().toString().slice(-6)}`
    const total = cart.totalToman
    cart.clear()
    result.value = { orderNumber, totalToman: total }
    return
  }

  submitting.value = true
  try {
    const items = cart.items.map((item) => ({
      itemType: item.itemType,
      itemId: item.itemId,
      quantity: item.quantity,
      variantId: item.variantId ?? undefined
    }))
    const response = await $fetch<OrderResult>('/api/orders', {
      method: 'POST',
      body: { ...form, otpCode: otpCode.value, items }
    })
    cart.clear()
    if (response.redirectUrl) {
      window.location.href = response.redirectUrl
      return
    }
    result.value = response
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <!-- Success -->
    <div v-if="result" class="rounded-2xl border border-silver/70 bg-white p-10 text-center">
      <span aria-hidden="true" class="font-serif text-4xl text-ice-500">✦</span>
      <h1 class="mt-4 font-serif text-3xl font-bold text-ink">سفارش ثبت شد</h1>
      <p class="mt-3 text-ink-500">شماره سفارش: {{ result.orderNumber }}</p>
      <p class="mt-1 text-ink-400">مبلغ قابل پرداخت: {{ formatToman(result.totalToman) }}</p>
      <p class="mt-4 text-sm text-ink-400">پرداخت آنلاین در مرحله بعدی فعال می‌شود.</p>
      <NuxtLink to="/" class="btn-primary mt-6">بازگشت به فروشگاه</NuxtLink>
    </div>

    <!-- Empty cart -->
    <div v-else-if="cart.items.length === 0" class="flex flex-col items-center py-20 text-center">
      <span aria-hidden="true" class="font-serif text-4xl text-ice-500/60">✦</span>
      <p class="mt-4 text-ink-400">سبد خرید خالی است.</p>
      <NuxtLink to="/" class="btn-ghost mt-6">مشاهده محصولات</NuxtLink>
    </div>

    <!-- Checkout form -->
    <div v-else>
      <div class="flex items-center gap-4">
        <h1 class="font-serif text-4xl font-bold text-ink">ثبت سفارش</h1>
        <span class="h-px flex-1 bg-silver/70"></span>
      </div>

      <!-- Cart summary -->
      <ul class="mt-6 space-y-2.5 rounded-2xl border border-silver/70 bg-white p-5 text-sm">
        <li
          v-for="item in cart.items"
          :key="`${item.itemType}-${item.itemId}-${item.variantId}`"
          class="flex justify-between gap-4"
        >
          <span class="text-ink-400">
            {{ item.nameFa }}
            <span v-if="item.variantLabel" class="text-ink-400">({{ item.variantLabel }})</span>
            × {{ item.quantity }}
          </span>
          <span class="text-ink">{{ formatToman(item.priceToman * item.quantity) }}</span>
        </li>
        <li class="flex justify-between border-t border-silver/60 pt-3 font-medium text-ink">
          <span>جمع کل</span>
          <span class="text-clay">{{ formatToman(cart.totalToman) }}</span>
        </li>
      </ul>

      <!-- Customer info -->
      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <label class="block text-sm text-ink-400">
          نام و نام خانوادگی
          <input v-model="form.customerName" type="text" required class="field-input" />
        </label>
        <label class="block text-sm text-ink-400">
          شماره موبایل
          <input v-model="form.phone" type="tel" dir="ltr" placeholder="09xxxxxxxxx" required class="field-input" />
        </label>
        <label class="block text-sm text-ink-400">
          استان
          <input v-model="form.province" type="text" required class="field-input" />
        </label>
        <label class="block text-sm text-ink-400">
          شهر
          <input v-model="form.city" type="text" required class="field-input" />
        </label>
        <label class="block text-sm text-ink-400 sm:col-span-2">
          آدرس کامل
          <input v-model="form.address" type="text" required class="field-input" />
        </label>
        <label class="block text-sm text-ink-400">
          کد پستی (اختیاری)
          <input v-model="form.postalCode" type="text" dir="ltr" class="field-input" />
        </label>
      </div>

      <!-- OTP -->
      <div class="mt-6 rounded-2xl border border-silver/70 bg-white p-5">
        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model="otpCode"
            type="text"
            inputmode="numeric"
            maxlength="5"
            dir="ltr"
            placeholder="کد ۵ رقمی"
            class="w-40 rounded-xl border border-silver/80 bg-paper-50 px-3 py-2.5 text-center tracking-widest text-ink placeholder:text-ink-400 focus:border-ice-500 focus:outline-none focus:ring-1 focus:ring-ice-500/50"
          />
          <button
            :disabled="sending"
            class="rounded-full border border-silver/90 px-5 py-2.5 text-sm text-ink transition-all duration-300 hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:opacity-50"
            @click="sendOtp"
          >
            {{ sending ? 'در حال ارسال...' : otpSent ? 'ارسال مجدد' : 'ارسال کد' }}
          </button>
        </div>
        <p v-if="otpSent" class="mt-3 text-xs text-ice-700">کد تأیید ارسال شد.</p>
        <p v-if="devCodeFilled" class="mt-1 text-xs text-clay">کد در حالت توسعه به‌صورت خودکار وارد شد.</p>
      </div>

      <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-700">{{ errorMessage }}</p>

      <button
        :disabled="submitting || !otpSent"
        class="btn-primary mt-6 w-full py-3.5 disabled:cursor-not-allowed disabled:opacity-40"
        @click="submitOrder"
      >
        {{ submitting ? 'در حال ثبت...' : 'ثبت نهایی سفارش' }}
      </button>
    </div>
  </div>
</template>
