<script setup lang="ts">
import type { Product, Category } from '~/types/catalog'
import { formatToman } from '~/utils/formatToman'
import { getErrorMessage } from '~/utils/getErrorMessage'

definePageMeta({ layout: 'admin' })

const runtime = useRuntimeConfig()
// Static demo = per-browser sandbox (editable locally). Full-stack demo = read-only.
const canEdit = runtime.public.staticMode === true || runtime.public.demo === false

const { data, addProduct, updateProduct, deleteProduct } = useShopData()
const products = computed(() => data.value.products)
const categories = computed(() => data.value.categories)

const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const errorMessage = ref('')

interface ProductForm {
  nameFa: string
  slug: string
  categoryId: number | null
  priceToman: number
  stockCount: number
  material: string
  weightGrams: string
  image: string | null
  status: string
  isExclusive: boolean
  descriptionFa: string
  seoTitle: string
  seoDescription: string
}

const emptyForm = (): ProductForm => ({
  nameFa: '',
  slug: '',
  categoryId: null,
  priceToman: 0,
  stockCount: 0,
  material: '',
  weightGrams: '',
  image: null,
  status: 'ACTIVE',
  isExclusive: false,
  descriptionFa: '',
  seoTitle: '',
  seoDescription: ''
})

const form = reactive<ProductForm>(emptyForm())

function openCreate() {
  Object.assign(form, emptyForm())
  editingId.value = null
  showForm.value = true
  errorMessage.value = ''
}

function openEdit(product: Product) {
  Object.assign(form, {
    nameFa: product.nameFa,
    slug: product.slug,
    categoryId: product.category?.id ?? null,
    priceToman: product.priceToman,
    stockCount: product.stockCount,
    material: product.material ?? '',
    weightGrams: product.weightGrams != null ? String(product.weightGrams) : '',
    image: product.image ?? null,
    status: product.status,
    isExclusive: product.isExclusive,
    descriptionFa: product.descriptionFa ?? '',
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? ''
  })
  editingId.value = product.id
  showForm.value = true
  errorMessage.value = ''
}

async function save() {
  saving.value = true
  errorMessage.value = ''
  try {
    const payload = {
      nameFa: form.nameFa,
      categoryId: form.categoryId,
      priceToman: form.priceToman,
      stockCount: form.stockCount,
      material: form.material || null,
      weightGrams: form.weightGrams.trim() ? Number(form.weightGrams) : null,
      image: form.image?.trim() || null,
      status: form.status,
      isExclusive: form.isExclusive,
      descriptionFa: form.descriptionFa || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {})
    }
    if (editingId.value) {
      updateProduct(editingId.value, {
        nameFa: payload.nameFa,
        slug: payload.slug || payload.nameFa,
        category: categories.value.find((c) => c.id === payload.categoryId) ?? null,
        priceToman: payload.priceToman,
        stockCount: payload.stockCount,
        material: payload.material,
        weightGrams: payload.weightGrams,
        image: payload.image,
        status: payload.status,
        isExclusive: payload.isExclusive,
        descriptionFa: payload.descriptionFa,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription
      })
    } else {
      addProduct({
        id: Math.max(0, ...data.value.products.map((p) => p.id)) + 1,
        nameFa: payload.nameFa,
        slug: payload.slug || payload.nameFa,
        descriptionFa: payload.descriptionFa,
        priceToman: payload.priceToman,
        material: payload.material,
        weightGrams: payload.weightGrams,
        image: payload.image,
        status: payload.status,
        stockCount: payload.stockCount,
        isExclusive: payload.isExclusive,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
        category: categories.value.find((c) => c.id === payload.categoryId) ?? null,
        variants: []
      })
    }
    showForm.value = false
  } catch (error) {
    errorMessage.value = getErrorMessage(error)
  } finally {
    saving.value = false
  }
}

function remove(product: Product) {
  if (!confirm(`حذف «${product.nameFa}»؟`)) return
  deleteProduct(product.id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">محصولات</h1>
      <button v-if="canEdit" class="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white" @click="openCreate">
        محصول جدید
      </button>
    </div>

    <form v-if="showForm && canEdit" class="mt-6 rounded-lg border border-neutral-200 bg-white p-5" @submit.prevent="save">
      <h2 class="font-semibold">{{ editingId ? 'ویرایش محصول' : 'محصول جدید' }}</h2>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <label class="block text-sm">نام
          <input v-model="form.nameFa" type="text" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">دسته‌بندی
          <select v-model="form.categoryId" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2">
            <option :value="null">بدون دسته</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.nameFa }}</option>
          </select>
        </label>
        <label class="block text-sm">قیمت (تومان)
          <input v-model.number="form.priceToman" type="number" min="0" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">موجودی
          <input v-model.number="form.stockCount" type="number" min="0" required class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">جنس
          <input v-model="form.material" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">وزن (گرم)
          <input v-model="form.weightGrams" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <AdminImageUpload v-model="form.image" folder="products" label="تصویر" />
        <label class="block text-sm">اسلاگ (اختیاری)
          <input v-model="form.slug" type="text" dir="ltr" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">وضعیت
          <select v-model="form.status" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2">
            <option value="ACTIVE">فعال</option>
            <option value="DRAFT">پیش‌نویس</option>
            <option value="SOLD_OUT">ناموجود</option>
            <option value="ARCHIVED">بایگانی</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input v-model="form.isExclusive" type="checkbox" />
          اثر اختصاصی (تک)
        </label>
        <label class="block text-sm sm:col-span-2">توضیحات
          <textarea v-model="form.descriptionFa" rows="3" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"></textarea>
        </label>
        <label class="block text-sm">عنوان سئو
          <input v-model="form.seoTitle" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
        </label>
        <label class="block text-sm">توضیح سئو
          <input v-model="form.seoDescription" type="text" class="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2" />
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

    <div class="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-neutral-200 text-right">
            <th class="p-3">نام</th>
            <th class="p-3">قیمت</th>
            <th class="p-3">موجودی</th>
            <th class="p-3">وضعیت</th>
            <th class="p-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="border-b border-neutral-100">
            <td class="p-3">
              {{ product.nameFa }}
              <span v-if="product.isExclusive" class="mr-1 rounded bg-accent px-1.5 py-0.5 text-xs text-white">اختصاصی</span>
            </td>
            <td class="p-3">{{ formatToman(product.priceToman) }}</td>
            <td class="p-3">
              <span :class="product.stockCount <= 3 ? 'text-red-600 font-medium' : ''">{{ product.stockCount }}</span>
              <span v-if="product.stockCount <= 3" class="mr-1 text-xs text-red-500">کم</span>
            </td>
            <td class="p-3">{{ product.status }}</td>
            <td class="p-3 text-left whitespace-nowrap">
              <template v-if="canEdit">
                <button class="text-sm text-accent-dark" @click="openEdit(product)">ویرایش</button>
                <button class="mr-3 text-sm text-red-600" @click="remove(product)">حذف</button>
              </template>
              <span v-else class="text-neutral-400">—</span>
            </td>
          </tr>
          <tr v-if="!products?.length">
            <td colspan="5" class="p-6 text-center text-neutral-500">محصولی ثبت نشده است.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
