<script setup lang="ts">
import { getErrorMessage } from '~/utils/getErrorMessage'

definePageMeta({ layout: false })

const isDev = import.meta.dev
const runtime = useRuntimeConfig()
const demo = runtime.public.demo === true
const demoUser = runtime.public.demoUser
const demoPassword = runtime.public.demoPassword

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function login() {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    navigateTo('/admin')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

async function devLogin() {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/auth/dev-login', { method: 'POST' })
    navigateTo('/admin')
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div dir="rtl" class="flex min-h-screen items-center justify-center bg-paper px-4">
    <form class="w-full max-w-sm rounded-2xl border border-silver/70 bg-white p-6 shadow-[0_2px_20px_-12px_rgba(58,51,44,0.18)]" @submit.prevent="login">
      <div class="flex items-center gap-2">
        <span aria-hidden="true" class="text-ice-500">✦</span>
        <h1 class="font-serif text-2xl font-bold text-ink">ورود مدیریت</h1>
      </div>

      <label class="mt-5 block text-sm text-ink-400">
        نام کاربری
        <input v-model="username" type="text" class="field-input" />
      </label>

      <label class="mt-3 block text-sm text-ink-400">
        رمز عبور
        <input v-model="password" type="password" class="field-input" />
      </label>

      <p v-if="errorMessage" class="mt-3 rounded-lg bg-red-50 p-2.5 text-sm text-red-600">{{ errorMessage }}</p>

      <button :disabled="loading" class="btn-primary mt-5 w-full py-3 disabled:opacity-50">
        {{ loading ? 'در حال ورود...' : 'ورود' }}
      </button>

      <!-- Public demo: show the read-only admin credentials. -->
      <div v-if="demo" class="mt-5 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-800">
        <p class="font-medium">حالت دمو — پنل فقط‌خواندنی است.</p>
        <p class="mt-1 text-xs text-amber-700">
          کاربر: <b class="font-semibold text-amber-900">{{ demoUser }}</b>
          <span v-if="demoPassword"> · رمز: <b class="font-semibold text-amber-900">{{ demoPassword }}</b></span>
        </p>
        <p class="mt-1 text-xs text-amber-700">اطلاعات را نمی‌توان تغییر داد؛ فقط مشاهده.</p>
      </div>

      <!-- Development-only: one-click login with the seeded default admin. -->
      <div v-if="isDev" class="mt-5 rounded-xl border border-dashed border-silver/80 bg-paper-50 p-3.5 text-sm">
        <p class="text-ink-400">حالت توسعه — ورود سریع:</p>
        <p class="mt-1 text-xs text-ink-400">
          کاربر: <b class="text-ink">admin</b> · رمز: <b class="text-ink">admin1234</b>
        </p>
        <button
          type="button"
          :disabled="loading"
          class="mt-3 w-full rounded-full border border-clay/70 bg-white px-4 py-2.5 text-sm font-medium text-clay transition-all duration-300 hover:bg-clay hover:text-white disabled:opacity-50"
          @click="devLogin"
        >
          ورود با کاربر پیش‌فرض
        </button>
      </div>
    </form>
  </div>
</template>
