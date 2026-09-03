<script setup lang="ts">
// story: demo
// Public-demo banner. Only renders when DEMO_MODE=true (see nuxt.config runtimeConfig).
const runtime = useRuntimeConfig()
const demo = computed(() => runtime.public.demo === true)

withDefaults(defineProps<{
  label?: string
  showLink?: boolean
  linkTo?: string
  linkLabel?: string
}>(), {
  label: 'نسخهٔ نمایشی — همهٔ محتوا فقط‌خواندنی است',
  showLink: false,
  linkTo: '/admin',
  linkLabel: 'مشاهدهٔ پنل (فقط‌خواندنی)'
})
</script>

<template>
  <div
    v-if="demo"
    dir="rtl"
    class="relative z-50 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800"
  >
    <span aria-hidden="true" class="text-sm">✦</span>
    <span>{{ label }}</span>
    <NuxtLink
      v-if="showLink"
      :to="linkTo"
      class="underline decoration-dotted underline-offset-2 hover:text-amber-900"
    >
      {{ linkLabel }}
    </NuxtLink>
  </div>
</template>
