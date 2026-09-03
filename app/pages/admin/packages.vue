<script setup lang="ts">
import type { Package, Product } from '~/types/catalog'
import { formatToman } from '~/utils/formatToman'
import { getErrorMessage } from '~/utils/getErrorMessage'

definePageMeta({ layout: 'admin' })

const runtime = useRuntimeConfig()
// Static demo = per-browser sandbox (editable locally). Full-stack demo = read-only.
const canEdit = runtime.public.staticMode === true || runtime.public.demo === false

const { data, addPackage, updatePackage, deletePackage } = useShopData()
const packages = computed(() => data.value.packages)
const products = computed(() => data.value.products)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

interface PackageForm {
  nameFa: string
  slug: string
  descriptionFa: string
  priceToman: number
  image: string | null
  status: string
  stockCount: number
  seoTitle: string
  seoDescription: string
}

const emptyForm = (): PackageForm => ({
  nameFa: '', slug: '', descriptionFa: '', priceToman: 0, image: null,
  status: 'ACTIVE', stockCount: 0, seoTitle: '', seoDescription: ''
})

const form = reactive<PackageForm>(emptyForm())
const selectedProductIds = ref<number[]>([])

function openCreate() {
  Object.assign(form, emptyForm())
  selectedProductIds.value = []
  editingId.value = null
  showForm.value = true
  errorMessage.value = ''
}

function openEdit(pkg: Package) {
  Object.assign(form, {
    nameFa: pkg.nameFa,
    slug: pkg.slug,
    descriptionFa: pkg.descriptionFa ?? '',
    priceToman: pkg.priceToman,
    image: pkg.image ?? null,
    status: pkg.status,
    stockCount: pkg.stockCount,
    seoTitle: pkg.seoTitle ?? '',
    seoDescription: pkg.seoDescription ?? ''
  })
  selectedProductIds.value = pkg.items.map((i) => i.product.id)
  editingId.value = pkg.id
  showForm.value = true
  errorMessage.value = ''
}

function toggleProduct(id: number) {
  if (selectedProductIds.value.includes(id)) {
    selectedProductIds.value = selectedProductIds.value.filter((x) => x !== id)
  } else {
    selectedProductIds.value.push(id)
  }
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      nameFa: form.nameFa,
      priceToman: form.priceToman,
      stockCount: form.stockCount,
      image: form.image?.trim() || null,
      status: form.status,
      descriptionFa: form.descriptionFa || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      items: selectedProductIds.value.map((id) => ({ productId: id, quantity: 1 }))
    }
    const items = selectedProductIds.value
      .map((id) => products.value.find((x) => x.id === id))
      .filter((x): x is Product => !!x)
      .map((product) => ({
        id: Math.ceil(Math.random() * 1e9),
        quantity: 1,
        product,
        variant: null
      }))
    const next = {
      nameFa: payload.nameFa,
      slug: payload.slug || payload.nameFa,
      descriptionFa: payload.descriptionFa,
      priceToman: payload.priceToman,
      image: payload.image,
      status: payload.status,
      stockCount: payload.stockCount,
      seoTitle: payload.seoTitle,
      seoDescription: payload.seoDescription,
      items
    }
    if (editingId.value) {
      updatePackage(editingId.value, next)
    } else {
      addPackage({ id: Math.max(0, ...data.value.packages.map((p) => p.id)) + 1, ...next })
    }
    showForm.value = false
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

function remove(pkg: Package) {
  if (!confirm(`حذف «${pkg.nameFa}»؟`)) return
  deletePackage(pkg.id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">پکیج‌ها</h1>
      <button v-if="canEdit" class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white" @click="openCreate">
        پکیج جدید
      </button>
    </div>

    <form v-if="showForm && canEdit" class="mt-6 rounded-lg border border-neutral-200 bg-white p-5" @submit.prevent="save">
      <h2 class="font-semibold">{{ editingId ? 'ویرایش پکیج' : 'پکیج جدید' }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <label class="block text-sm">نام
          <input v-model="form.nameFa" type="text" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">قیمت (تومان)
          <input v-model.number="form.priceToman" type="number" min="0" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">موجودی
          <input v-model.number="form.stockCount" type="number" min="0" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <AdminImageUpload v-model="form.image" folder="packages" label="تصویر" />
        <label class="block text-sm">وضعیت
          <select v-model="form.status" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2">
            <option value="ACTIVE">فعال</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="SOLD_OUT">ناموجود</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </label>
        <label class="block text-sm">اسلاگ (اختیاری)
          <input v-model="form.slug" type="text" dir="ltr" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm sm:col-span-2">توضیحات
          <textarea v-model="form.descriptionFa" rows="2" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"></textarea>
        </label>
        <label class="block text-sm">عنوان سئو
          <input v-model="form.seoTitle" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">توضیح سئو
          <input v-model="form.seoDescription" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
      </div>

      <div class="mt-4">
        <p class="mb-2 text-sm font-medium">محصولات داخل پکیج:</p>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label v-for="p in products" :key="p.id" class="flex items-center gap-2 text-sm">
            <input type="checkbox" :checked="selectedProductIds.includes(p.id)" @change="toggleProduct(p.id)" />
            {{ p.nameFa }}
          </label>
        </div>
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

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div v-for="pkg in packages" :key="pkg.id" class="rounded-lg border border-neutral-200 bg-white p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">{{ pkg.nameFa }}</h3>
          <span class="text-sm text-neutral-500">{{ pkg.status }}</span>
        </div>
        <p class="mt-1 text-sm text-neutral-600">{{ pkg.descriptionFa }}</p>
        <p class="mt-2 text-sm text-accent-dark">{{ formatToman(pkg.priceToman) }}</p>
        <ul class="mt-2 text-sm text-neutral-600">
          <li v-for="item in pkg.items" :key="item.id">{{ item.product.nameFa }} × {{ item.quantity }}</li>
        </ul>
        <div class="mt-3 flex gap-3">
          <template v-if="canEdit">
            <button class="text-sm text-accent-dark" @click="openEdit(pkg)">ویرایش</button>
            <button class="text-sm text-red-600" @click="remove(pkg)">حذف</button>
          </template>
          <span v-else class="text-neutral-400">—</span>
        </div>
      </div>
      <p v-if="!packages?.length" class="text-neutral-500">پکیجی ثبت نشده است.</p>
    </div>
  </div>
</template>
