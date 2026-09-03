<script setup lang="ts">
import type { BlogPost } from '~/types/blog'
import { getErrorMessage } from '~/utils/getErrorMessage'
import { toShamsiDate } from '~/utils/shamsiDate'
import { renderMarkdown } from '~/utils/markdown'

definePageMeta({ layout: 'admin' })

const runtime = useRuntimeConfig()
// Static demo = per-browser sandbox (editable locally). Full-stack demo = read-only.
const canEdit = runtime.public.staticMode === true || runtime.public.demo === false

const { data, addPost, updatePost, deletePost } = useShopData()
const posts = computed(() => data.value.posts)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

interface PostForm {
  titleFa: string
  contentMd: string
  seoTitle: string
  seoDescription: string
  published: boolean
}

const emptyForm = (): PostForm => ({
  titleFa: '', contentMd: '', seoTitle: '', seoDescription: '', published: false
})

const form = reactive<PostForm>(emptyForm())

function openCreate() {
  Object.assign(form, emptyForm())
  editingId.value = null
  showForm.value = true
  errorMessage.value = ''
}

function openEdit(post: BlogPost) {
  Object.assign(form, {
    titleFa: post.titleFa,
    contentMd: post.contentMd,
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
    published: post.published
  })
  editingId.value = post.id
  showForm.value = true
  errorMessage.value = ''
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      titleFa: form.titleFa,
      contentMd: form.contentMd,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      published: form.published
    }
    const now = new Date().toISOString()
    const contentHtml = renderMarkdown(payload.contentMd)
    const next = {
      titleFa: payload.titleFa,
      slug: payload.titleFa,
      contentMd: payload.contentMd,
      contentHtml,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,
      published: payload.published,
      publishedAt: payload.published ? now : null,
      createdAt: now,
      updatedAt: now
    }
    if (editingId.value) {
      updatePost(editingId.value, next)
    } else {
      addPost({ id: Math.max(0, ...data.value.posts.map((p) => p.id)) + 1, ...next })
    }
    showForm.value = false
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

function remove(post: BlogPost) {
  if (!confirm(`حذف «${post.titleFa}»؟`)) return
  deletePost(post.id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">وبلاگ</h1>
      <button v-if="canEdit" class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white" @click="openCreate">
        مقاله جدید
      </button>
    </div>

    <form v-if="showForm && canEdit" class="mt-6 rounded-lg border border-neutral-200 bg-white p-5" @submit.prevent="save">
      <h2 class="font-semibold">{{ editingId ? 'ویرایش مقاله' : 'مقاله جدید' }}</h2>
      <div class="mt-4 grid gap-4">
        <label class="block text-sm">عنوان
          <input v-model="form.titleFa" type="text" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">متن (Markdown)
          <textarea v-model="form.contentMd" rows="10" dir="auto" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm leading-relaxed"></textarea>
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm">عنوان سئو
            <input v-model="form.seoTitle" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
          </label>
          <label class="block text-sm">توضیح سئو
            <input v-model="form.seoDescription" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
          </label>
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.published" type="checkbox" />
          انتشار (نمایش در وب‌سایت)
        </label>
      </div>

      <p v-if="errorMessage" class="mt-3 text-sm text-red-600">{{ errorMessage }}</p>

      <div class="mt-4 flex gap-2">
        <button :disabled="saving" class="rounded-md bg-neutral-900 px-5 py-2 text-sm text-white disabled:opacity-50">
          {{ saving ? 'در حال ذخیره...' : 'ذخیره' }}
        </button>
        <button type="button" class="rounded-md border border-neutral-300 px-5 py-2 text-sm" @click="showForm = false">
          انصراف
        </button>
      </div>
    </form>

    <div class="mt-6 space-y-3">
      <div v-for="post in posts" :key="post.id" class="rounded-lg border border-neutral-200 bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="font-semibold">{{ post.titleFa }}</h3>
          <span
            class="rounded-full px-2.5 py-0.5 text-xs"
            :class="post.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ post.published ? 'منتشرشده' : 'پیش‌نویس' }}
          </span>
        </div>
        <p class="mt-1 text-xs text-neutral-500" dir="ltr">/blog/{{ post.slug }}</p>
        <p class="mt-1 text-xs text-neutral-500">
          {{ post.published ? `تاریخ انتشار: ${toShamsiDate(post.publishedAt)}` : 'منتشر نشده است' }}
        </p>
        <div class="mt-3 flex gap-3">
          <template v-if="canEdit">
            <button class="text-sm text-accent-dark" @click="openEdit(post)">ویرایش</button>
            <button class="text-sm text-red-600" @click="remove(post)">حذف</button>
          </template>
          <span v-else class="text-neutral-400">—</span>
        </div>
      </div>
      <p v-if="!posts?.length" class="text-neutral-500">مقاله‌ای ثبت نشده است.</p>
    </div>
  </div>
</template>
