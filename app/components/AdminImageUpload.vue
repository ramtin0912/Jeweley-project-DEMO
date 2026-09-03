<script setup lang="ts">
import { getErrorMessage } from '~/utils/getErrorMessage'

const props = defineProps<{
  modelValue: string | null
  folder: 'products' | 'packages' | 'portfolio'
  label?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string | null): void }>()

const uploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('folder', props.folder)
    formData.append('file', file)
    const res = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: formData
    })
    emit('update:modelValue', res.url)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

function trigger() {
  fileInput.value?.click()
}

function clear() {
  emit('update:modelValue', null)
}
</script>

<template>
  <div>
    <span class="block text-sm">{{ label || 'تصویر' }}</span>
    <div class="mt-1">
      <div
        class="relative flex h-44 w-full overflow-hidden rounded-md border border-dashed transition-colors"
        :class="modelValue ? 'border-neutral-200' : 'cursor-pointer items-center justify-center border-neutral-300 hover:border-ice-500'"
        @click="!modelValue && trigger()"
      >
        <img
          v-if="modelValue"
          :src="modelValue"
          :alt="label || 'پیش‌نمایش تصویر'"
          class="h-full w-full object-cover"
        />
        <div v-else class="flex flex-col items-center gap-1 text-neutral-400">
          <span aria-hidden="true" class="text-3xl leading-none">+</span>
          <span class="text-xs">انتخاب تصویر</span>
        </div>

        <div
          v-if="uploading"
          class="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-neutral-600"
        >
          در حال آپلود...
        </div>

        <div
          v-if="modelValue && !uploading"
          class="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 transition-opacity hover:opacity-100"
        >
          <button
            type="button"
            class="rounded bg-white/90 px-2.5 py-1 text-xs text-neutral-700"
            @click.stop="trigger"
          >
            تغییر
          </button>
          <button
            type="button"
            class="rounded bg-red-600/90 px-2.5 py-1 text-xs text-white"
            @click.stop="clear"
          >
            حذف
          </button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        class="hidden"
        @change="onFileChange"
      />
      <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    </div>
  </div>
</template>
