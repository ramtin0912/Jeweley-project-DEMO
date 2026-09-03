/**
 * @file catalog
 * @description Shared catalog types matching the API responses.
 *
 * @status None
 * @issues None
 * @todo None
 */

export interface Category {
  id: number
  nameFa: string
  slug: string
  sortOrder: number
  _count?: { products: number }
}

export interface ProductVariant {
  id: number
  label: string
  value: string
  priceDeltaToman: number
  stockCount: number
}

export interface Product {
  id: number
  nameFa: string
  slug: string
  descriptionFa: string | null
  priceToman: number
  material: string | null
  weightGrams: number | null
  image: string | null
  status: string
  stockCount: number
  isExclusive: boolean
  seoTitle: string | null
  seoDescription: string | null
  category?: Category | null
  variants: ProductVariant[]
}

export interface PackageItem {
  id: number
  quantity: number
  product: Product
  variant: ProductVariant | null
}

export interface Package {
  id: number
  nameFa: string
  slug: string
  descriptionFa: string | null
  priceToman: number
  image: string | null
  status: string
  stockCount: number
  seoTitle: string | null
  seoDescription: string | null
  items: PackageItem[]
}

export interface PortfolioWork {
  id: number
  titleFa: string
  descriptionFa: string | null
  image: string | null
  material: string | null
  year: number | null
  isFeatured: boolean
}
