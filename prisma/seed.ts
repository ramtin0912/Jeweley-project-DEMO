/**
 * @file seed
 * @description Demo catalog seed (categories, products, packages, portfolio) plus a
 *   realistic set of demo orders spread across the current and previous Shamsi months
 *   so the finance hub, dashboard, and orders page all render data.
 *
 * @status Demo data only
 * @issues None
 * @todo Replace with the real product catalog.
 */
// story: e03s02
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

interface SeedOrderItem {
  itemType: 'product' | 'package'
  itemId: number
  nameFa: string
  priceToman: number
  quantity: number
}

type SeedOrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED'

interface SeedOrder {
  daysAgo: number
  customerName: string
  customerPhone: string
  province: string
  city: string
  address: string
  postalCode?: string
  status: SeedOrderStatus
  items: SeedOrderItem[]
}

/** A timestamp `days` whole days before now, at a fixed business hour (Asia/Tehran). */
function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(11, 0, 0, 0)
  return d
}

function orderTotal(items: SeedOrderItem[]): number {
  return items.reduce((sum, item) => sum + item.priceToman * item.quantity, 0)
}

async function main() {
  // Clear existing data (order matters for foreign keys).
  await prisma.packageItem.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.portfolioWork.deleteMany()
  await prisma.package.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Categories
  const necklace = await prisma.category.create({
    data: { nameFa: 'گردنبند', slug: 'necklace', sortOrder: 1 }
  })
  const bracelet = await prisma.category.create({
    data: { nameFa: 'دستبند', slug: 'bracelet', sortOrder: 2 }
  })
  const earrings = await prisma.category.create({
    data: { nameFa: 'گوشواره', slug: 'earrings', sortOrder: 3 }
  })
  const ring = await prisma.category.create({
    data: { nameFa: 'انگشتر', slug: 'ring', sortOrder: 4 }
  })

  // Products
  const necklaceMoon = await prisma.product.create({
    data: {
      categoryId: necklace.id,
      nameFa: 'گردنبند نقره طرح ماه',
      slug: 'gardanband-mah',
      descriptionFa: 'گردنبند نقره ۹۲۵ با آویز طرح ماه، سبک و مناسب استفاده روزمره.',
      image: '/images/products/gardanband-mah.jpg',
      priceToman: 1_250_000,
      material: 'نقره ۹۲۵',
      weightGrams: 8.5,
      stockCount: 3,
      variants: {
        create: [
          { label: 'طول زنجیر', value: '۴۰ سانتی‌متر', priceDeltaToman: 0, stockCount: 3 },
          { label: 'طول زنجیر', value: '۴۵ سانتی‌متر', priceDeltaToman: 100_000, stockCount: 2 }
        ]
      }
    }
  })

  const necklaceMinimal = await prisma.product.create({
    data: {
      categoryId: necklace.id,
      nameFa: 'گردنبند نقره مینیمال',
      slug: 'gardanband-minimal',
      descriptionFa: 'گردنبند ظریف و مینیمال نقره، بدون نگین و مناسب استایل روزمره.',
      image: '/images/products/gardanband-minimal.jpg',
      priceToman: 980_000,
      material: 'نقره ۹۲۵',
      weightGrams: 5.2,
      stockCount: 5
    }
  })

  const braceletChain = await prisma.product.create({
    data: {
      categoryId: bracelet.id,
      nameFa: 'دستبند نقره زنجیری',
      slug: 'dastband-zanjiri',
      descriptionFa: 'دستبند زنجیری نقره با قفل محکم و روکش ضد حساسیت.',
      image: '/images/products/dastband-zanjiri.jpg',
      priceToman: 1_450_000,
      material: 'نقره ۹۲۵',
      weightGrams: 12.0,
      stockCount: 4
    }
  })

  const earringsDrop = await prisma.product.create({
    data: {
      categoryId: earrings.id,
      nameFa: 'گوشواره نقره اشکی',
      slug: 'gushvare-ashki',
      descriptionFa: 'گوشواره آویز اشکی نقره، سبک و مناسب هدیه.',
      image: '/images/products/gushvare-ashki.jpg',
      priceToman: 720_000,
      material: 'نقره ۹۲۵',
      weightGrams: 4.0,
      stockCount: 6
    }
  })

  const ringAgate = await prisma.product.create({
    data: {
      categoryId: ring.id,
      nameFa: 'انگشتر نقره عقیق',
      slug: 'angoshtar-aghigh',
      descriptionFa: 'انگشتر نقره با نگین عقیق طبیعی، سایز قابل تنظیم.',
      image: '/images/products/angoshtar-aghigh.jpg',
      priceToman: 1_100_000,
      material: 'نقره ۹۲۵ و عقیق',
      weightGrams: 7.8,
      stockCount: 2
    }
  })

  const necklaceExclusive = await prisma.product.create({
    data: {
      categoryId: necklace.id,
      nameFa: 'گردنبند نقره اختصاصی',
      slug: 'gardanband-ekhtesasi',
      descriptionFa: 'قطعه تک و اختصاصی با دست‌ساز کامل و طرح منحصر به فرد.',
      image: '/images/products/gardanband-ekhtesasi.jpg',
      priceToman: 3_500_000,
      material: 'نقره ۹۲۵',
      weightGrams: 15.0,
      stockCount: 1,
      isExclusive: true
    }
  })

  // Packages (admin-curated, fixed price, sold as a single unit)
  const giftSet = await prisma.package.create({
    data: {
      nameFa: 'ست نقره هدیه',
      slug: 'set-noqreh-hediyeh',
      descriptionFa: 'ست گردنبند و دستبند نقره، بسته‌بندی هدیه.',
      image: '/images/packages/set-noqreh-hediyeh.jpg',
      priceToman: 2_200_000,
      stockCount: 2,
      items: {
        create: [
          { productId: necklaceMoon.id, quantity: 1 },
          { productId: braceletChain.id, quantity: 1 }
        ]
      }
    }
  })

  const bridalSet = await prisma.package.create({
    data: {
      nameFa: 'پکیج هدیه عروس',
      slug: 'hediyeh-aroos',
      descriptionFa: 'ست گردنبند مینیمال و گوشواره اشکی، مناسب هدیه عروس.',
      image: '/images/packages/hediyeh-aroos.jpg',
      priceToman: 1_650_000,
      stockCount: 1,
      items: {
        create: [
          { productId: necklaceMinimal.id, quantity: 1 },
          { productId: earringsDrop.id, quantity: 1 }
        ]
      }
    }
  })

  // Demo orders — a realistic spread across the current and previous Shamsi months
  // (and a few older months) so the finance trend, dashboard, and orders page all
  // have data to render. Days are offsets from today, so the spread always lands in
  // the most recent months whatever day the seed is run on.
  const orderSeeds: SeedOrder[] = [
    { daysAgo: 2, status: 'DELIVERED', customerName: 'سارا محمدی', customerPhone: '09121234501', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲', postalCode: '19968', items: [{ itemType: 'product', itemId: necklaceMoon.id, nameFa: necklaceMoon.nameFa, priceToman: necklaceMoon.priceToman, quantity: 1 }] },
    { daysAgo: 5, status: 'SHIPPED', customerName: 'امیر حسینی', customerPhone: '09133456702', province: 'اصفهان', city: 'اصفهان', address: 'خیابان چهارباغ بالا، پلاک ۴۵', postalCode: '81739', items: [{ itemType: 'product', itemId: earringsDrop.id, nameFa: earringsDrop.nameFa, priceToman: earringsDrop.priceToman, quantity: 2 }] },
    { daysAgo: 8, status: 'PENDING', customerName: 'نازنین رضایی', customerPhone: '09141234503', province: 'فارس', city: 'شیراز', address: 'معالی‌آباد، خیابان شهریار، پلاک ۸', items: [{ itemType: 'product', itemId: ringAgate.id, nameFa: ringAgate.nameFa, priceToman: ringAgate.priceToman, quantity: 1 }] },
    { daysAgo: 11, status: 'CANCELED', customerName: 'رضا کریمی', customerPhone: '09121234504', province: 'خراسان رضوی', city: 'مشهد', address: 'بلوار سجاد، خیابان آب و برق، پلاک ۲۰', postalCode: '91879', items: [{ itemType: 'product', itemId: necklaceExclusive.id, nameFa: necklaceExclusive.nameFa, priceToman: necklaceExclusive.priceToman, quantity: 1 }] },

    { daysAgo: 15, status: 'DELIVERED', customerName: 'مریم احمدی', customerPhone: '09151234505', province: 'تهران', city: 'تهران', address: 'خیابان فرشته، بن‌بست نهم، پلاک ۳', postalCode: '19669', items: [{ itemType: 'package', itemId: giftSet.id, nameFa: giftSet.nameFa, priceToman: giftSet.priceToman, quantity: 1 }] },
    { daysAgo: 22, status: 'DELIVERED', customerName: 'علی نوری', customerPhone: '09141234506', province: 'آذربایجان شرقی', city: 'تبریز', address: 'خیابان امام، روبروی پارک، پلاک ۱۵', postalCode: '51368', items: [{ itemType: 'product', itemId: braceletChain.id, nameFa: braceletChain.nameFa, priceToman: braceletChain.priceToman, quantity: 1 }] },
    { daysAgo: 28, status: 'SHIPPED', customerName: 'فاطمه صادقی', customerPhone: '09191234507', province: 'البرز', city: 'کرج', address: 'مهرشهر، بلوار ارم، خیابان ۱۰۸', postalCode: '31844', items: [{ itemType: 'package', itemId: bridalSet.id, nameFa: bridalSet.nameFa, priceToman: bridalSet.priceToman, quantity: 1 }] },
    { daysAgo: 34, status: 'PAID', customerName: 'حسین عظیمی', customerPhone: '09123456708', province: 'اصفهان', city: 'کاشان', address: 'خیابان فاضل نراقی، پلاک ۲', postalCode: '87159', items: [{ itemType: 'product', itemId: necklaceMinimal.id, nameFa: necklaceMinimal.nameFa, priceToman: necklaceMinimal.priceToman, quantity: 1 }, { itemType: 'product', itemId: ringAgate.id, nameFa: ringAgate.nameFa, priceToman: ringAgate.priceToman, quantity: 1 }] },
    { daysAgo: 40, status: 'CANCELED', customerName: 'لیلا مرادی', customerPhone: '09121234509', province: 'قم', city: 'قم', address: 'خیابان ارم، کوچه صدف، پلاک ۷', postalCode: '37185', items: [{ itemType: 'product', itemId: earringsDrop.id, nameFa: earringsDrop.nameFa, priceToman: earringsDrop.priceToman, quantity: 1 }] },

    { daysAgo: 46, status: 'DELIVERED', customerName: 'محمد قاسمی', customerPhone: '09151234510', province: 'تهران', city: 'تهران', address: 'نیاوران، خیابان کامرانیه، پلاک ۲۲', postalCode: '19769', items: [{ itemType: 'product', itemId: necklaceExclusive.id, nameFa: necklaceExclusive.nameFa, priceToman: necklaceExclusive.priceToman, quantity: 1 }] },
    { daysAgo: 55, status: 'DELIVERED', customerName: 'زهرا طاهری', customerPhone: '09171234511', province: 'فارس', city: 'شیراز', address: 'خیابان زند، کوچه ۵، پلاک ۹', postalCode: '71348', items: [{ itemType: 'product', itemId: necklaceMoon.id, nameFa: necklaceMoon.nameFa, priceToman: necklaceMoon.priceToman, quantity: 1 }] },
    { daysAgo: 66, status: 'SHIPPED', customerName: 'امید رحیمی', customerPhone: '09151234512', province: 'خراسان رضوی', city: 'مشهد', address: 'خیابان امام رضا، پلاک ۳۳', postalCode: '91376', items: [{ itemType: 'package', itemId: giftSet.id, nameFa: giftSet.nameFa, priceToman: giftSet.priceToman, quantity: 1 }] },

    { daysAgo: 78, status: 'DELIVERED', customerName: 'الهام صفایی', customerPhone: '09121234513', province: 'تهران', city: 'تهران', address: 'سعادت‌آباد، خیابان سرو غربی، پلاک ۱۴', postalCode: '19978', items: [{ itemType: 'product', itemId: braceletChain.id, nameFa: braceletChain.nameFa, priceToman: braceletChain.priceToman, quantity: 1 }, { itemType: 'product', itemId: earringsDrop.id, nameFa: earringsDrop.nameFa, priceToman: earringsDrop.priceToman, quantity: 1 }] },
    { daysAgo: 88, status: 'DELIVERED', customerName: 'بهرام نظری', customerPhone: '09131234514', province: 'اصفهان', city: 'اصفهان', address: 'خیابان توحید، کوچه ۱۲، پلاک ۵', postalCode: '81666', items: [{ itemType: 'product', itemId: ringAgate.id, nameFa: ringAgate.nameFa, priceToman: ringAgate.priceToman, quantity: 1 }] },
    { daysAgo: 98, status: 'SHIPPED', customerName: 'شیرین کاظمی', customerPhone: '09141234515', province: 'آذربایجان شرقی', city: 'مراغه', address: 'خیابان ملک‌کاظم، پلاک ۱۸', postalCode: '55136', items: [{ itemType: 'product', itemId: necklaceMinimal.id, nameFa: necklaceMinimal.nameFa, priceToman: necklaceMinimal.priceToman, quantity: 2 }] },

    { daysAgo: 108, status: 'DELIVERED', customerName: 'پریسا جعفری', customerPhone: '09121234516', province: 'تهران', city: 'تهران', address: 'پاسداران، خیابان گلستان، پلاک ۲۶', postalCode: '16667', items: [{ itemType: 'product', itemId: necklaceMoon.id, nameFa: necklaceMoon.nameFa, priceToman: necklaceMoon.priceToman, quantity: 1 }, { itemType: 'product', itemId: braceletChain.id, nameFa: braceletChain.nameFa, priceToman: braceletChain.priceToman, quantity: 1 }] },
    { daysAgo: 118, status: 'DELIVERED', customerName: 'کامران یوسفی', customerPhone: '09171234517', province: 'فارس', city: 'شیراز', address: 'بلوار آزادی، خیابان گلستان، پلاک ۳', postalCode: '71449', items: [{ itemType: 'package', itemId: giftSet.id, nameFa: giftSet.nameFa, priceToman: giftSet.priceToman, quantity: 1 }] },
    { daysAgo: 128, status: 'DELIVERED', customerName: 'نسترن احدی', customerPhone: '09123456718', province: 'البرز', city: 'کرج', address: 'عظیمیه، بلوار طالقانی، پلاک ۱۱', postalCode: '31767', items: [{ itemType: 'product', itemId: earringsDrop.id, nameFa: earringsDrop.nameFa, priceToman: earringsDrop.priceToman, quantity: 1 }, { itemType: 'product', itemId: ringAgate.id, nameFa: ringAgate.nameFa, priceToman: ringAgate.priceToman, quantity: 1 }] }
  ]

  let orderSeq = 1000
  for (const seed of orderSeeds) {
    const createdAt = daysAgo(seed.daysAgo)
    const paidAt = seed.status === 'PENDING' || seed.status === 'CANCELED' ? null : createdAt
    await prisma.order.create({
      data: {
        orderNumber: `JS-SEED-${orderSeq++}`,
        customerName: seed.customerName,
        customerPhone: seed.customerPhone,
        province: seed.province,
        city: seed.city,
        address: seed.address,
        postalCode: seed.postalCode ?? null,
        status: seed.status,
        totalToman: orderTotal(seed.items),
        paidAt,
        createdAt,
        items: {
          create: seed.items.map((item) => ({
            itemType: item.itemType,
            itemId: item.itemId,
            nameFa: item.nameFa,
            priceToman: item.priceToman,
            quantity: item.quantity
          }))
        }
      }
    })
  }

  // Portfolio (past works — display only)
  await prisma.portfolioWork.create({
    data: {
      titleFa: 'گردنبند سفارشی عروس',
      descriptionFa: 'سفارش اختصاصی با زیرکن و پرداخت دستی.',
      image: '/images/portfolio/portfolio-necklace.jpg',
      material: 'نقره و زیرکن',
      year: 1403,
      isFeatured: true
    }
  })

  await prisma.portfolioWork.create({
    data: {
      titleFa: 'دستبند دست‌ساز گره',
      descriptionFa: 'بافت گره سنتی با مفتول نقره.',
      image: '/images/portfolio/portfolio-bracelet.jpg',
      material: 'نقره ۹۲۵',
      year: 1402
    }
  })

  await prisma.portfolioWork.create({
    data: {
      titleFa: 'ست گوشواره و گردنبند مروارید',
      descriptionFa: 'ترکیب مروارید طبیعی و نقره.',
      image: '/images/portfolio/portfolio-pearl-set.jpg',
      material: 'نقره و مروارید',
      year: 1401
    }
  })

  // Admin (single admin; default password via ADMIN_PASSWORD env, fallback admin1234)
  await prisma.admin.deleteMany()
  await prisma.admin.create({
    data: {
      username: 'admin',
      passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 10)
    }
  })

  // Blog posts (demo post)
  await prisma.post.deleteMany()
  await prisma.post.create({
    data: {
      titleFa: 'راهنمای انتخاب گردنبند نقره',
      slug: 'rahnama-nekland-noqreh',
      contentMd: '# راهنمای انتخاب گردنبند نقره\n\nانتخاب گردنبند نقره مناسب به فرم صورت، استایل شخصی و موقعیت استفاده بستگی دارد. نقره ۹۲۵ با عیار بالا برای استفاده روزمره مناسب است و حساسیت ایجاد نمی‌کند.\n\n## نکات مهم\n\n- به طول زنجیر توجه کنید؛ زنجیر کوتاه برای یقه‌های باز مناسب است.\n- برای پوست حساس از نقره ۹۲۵ استفاده کنید.\n- طرح‌های مینیمال برای استفاده روزمره بهترند.\n',
      seoTitle: 'راهنمای انتخاب گردنبند نقره',
      seoDescription: 'چگونه گردنبند نقره مناسب خود را انتخاب کنیم.',
      published: true,
      publishedAt: new Date()
    }
  })

  console.log('Seed complete.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
