/**
 * @file image upload
 * @description POST /api/admin/upload — accept a multipart image file and save
 *   it into public/images/<folder>/. Returns the public URL path.
 *
 * @status None
 * @issues None
 * @todo None
 */
import { resolve } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { requireAdmin } from '~~/server/utils/auth'

const ALLOWED_FOLDERS = ['products', 'packages', 'portfolio'] as const
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif'
}
const EXT_BY_NAME: Record<string, string> = {
  jpg: '.jpg',
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
  gif: '.gif',
  avif: '.avif'
}
const MAX_SIZE = 6 * 1024 * 1024 // 6 MB

function extForFile(type: string | undefined, filename: string | undefined): string | null {
  if (type && EXT_BY_TYPE[type]) return EXT_BY_TYPE[type]
  const match = filename?.match(/\.([a-z0-9]+)$/i)
  if (!match) return null
  const name = match[1]
  if (!name) return null
  return EXT_BY_NAME[name.toLowerCase()] ?? null
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'فایلی ارسال نشده است' })
  }

  const folder = parts.find((p) => p.name === 'folder')?.data?.toString('utf-8')?.trim() ?? ''
  if (!(ALLOWED_FOLDERS as readonly string[]).includes(folder)) {
    throw createError({ statusCode: 400, statusMessage: 'پوشه مقصد نامعتبر است' })
  }

  const filePart = parts.find((p) => p.name === 'file')
  if (!filePart || !filePart.data || filePart.data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'فایل تصویر نامعتبر است' })
  }
  if (filePart.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'حجم تصویر حداکثر ۶ مگابایت است' })
  }

  const ext = extForFile(filePart.type, filePart.filename)
  if (!ext) {
    throw createError({ statusCode: 400, statusMessage: 'فرمت تصویر پشتیبانی نمی‌شود' })
  }

  const unique = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`
  const dir = resolve(process.cwd(), 'public', 'images', folder)
  await mkdir(dir, { recursive: true })
  await writeFile(resolve(dir, unique), filePart.data)

  return { url: `/images/${folder}/${unique}` }
})
