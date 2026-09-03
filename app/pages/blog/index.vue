<script setup lang="ts">
import type { BlogPostSummary } from '~/types/blog'
import { toShamsiDate } from '~/utils/shamsiDate'

useSeoMeta({ title: 'وبلاگ', description: 'مقالات راهنمای خرید زیورآلات نقره' })

const { data } = useShopData()
const posts = computed(() =>
  data.value.posts
    .filter((p) => p.published)
    .map((p) => ({
      id: p.id,
      titleFa: p.titleFa,
      slug: p.slug,
      seoDescription: p.seoDescription,
      publishedAt: p.publishedAt
    }))
)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <p dir="ltr" class="font-engraved text-[11px] font-semibold uppercase tracking-[0.42em] text-silver-700">
      Journal
    </p>
    <div class="mt-3 flex items-center gap-4">
      <h1 class="font-serif text-4xl font-bold text-ink sm:text-5xl">وبلاگ</h1>
      <span class="h-px flex-1 bg-silver/70"></span>
    </div>

    <div class="mt-8 divide-y divide-silver/60 border-y border-silver/70">
      <NuxtLink
        v-for="post in posts"
        :key="post.id"
        :to="`/blog/${post.slug}`"
        class="group block py-6 transition-colors duration-300"
      >
        <h2 class="font-serif text-xl font-bold text-ink transition-colors duration-300 group-hover:text-clay">
          {{ post.titleFa }}
        </h2>
        <p v-if="post.seoDescription" class="mt-2 leading-relaxed text-ink-400">{{ post.seoDescription }}</p>
        <p class="mt-3 text-xs text-ink-400">
          {{ toShamsiDate(post.publishedAt) }}
          <span aria-hidden="true" class="mx-1.5 text-ice-500">✦</span>
          <span class="text-ice-700">مطالعه</span>
        </p>
      </NuxtLink>
    </div>

    <p v-if="!posts?.length" class="mt-8 text-ink-400">مقاله‌ای منتشر نشده است.</p>
  </div>
</template>
