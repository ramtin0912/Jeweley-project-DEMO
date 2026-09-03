<script setup lang="ts">
import type { BlogPostDetail } from '~/types/blog'
import { toShamsiDate } from '~/utils/shamsiDate'

const route = useRoute()
const slug = route.params.slug as string

const { data } = useShopData()
const post = computed(() => {
  const p = data.value.posts.find((x) => x.slug === slug && x.published)
  if (!p) return null
  return {
    id: p.id,
    titleFa: p.titleFa,
    slug: p.slug,
    contentHtml: p.contentHtml ?? '',
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    publishedAt: p.publishedAt
  }
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'پست یافت نشد', fatal: true })
}

useSeoMeta({
  title: () => post.value?.seoTitle || post.value?.titleFa || 'وبلاگ',
  description: () => post.value?.seoDescription || ''
})
</script>

<template>
  <article v-if="post" class="mx-auto max-w-3xl">
    <p dir="ltr" class="font-engraved text-[11px] font-semibold uppercase tracking-[0.42em] text-silver-700">
      Journal
    </p>
    <h1 class="mt-3 font-serif text-4xl font-bold leading-snug text-ink sm:text-5xl">{{ post.titleFa }}</h1>
    <p class="mt-3 flex items-center gap-2 text-sm text-ink-400">
      <span aria-hidden="true" class="text-ice-500">✦</span>
      {{ toShamsiDate(post.publishedAt) }}
    </p>
    <div class="markdown-content mt-8 border-t border-silver/70 pt-8" v-html="post.contentHtml"></div>
  </article>
</template>
