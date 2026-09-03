-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD_OUT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELED');

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name_fa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "name_fa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_fa" TEXT,
    "price_toman" INTEGER NOT NULL,
    "material" TEXT,
    "weight_grams" DOUBLE PRECISION,
    "image" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "stock_count" INTEGER NOT NULL DEFAULT 0,
    "is_exclusive" BOOLEAN NOT NULL DEFAULT false,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "price_delta_toman" INTEGER NOT NULL DEFAULT 0,
    "stock_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" SERIAL NOT NULL,
    "name_fa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description_fa" TEXT,
    "price_toman" INTEGER NOT NULL,
    "image" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "stock_count" INTEGER NOT NULL DEFAULT 0,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_items" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "package_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_works" (
    "id" SERIAL NOT NULL,
    "title_fa" TEXT NOT NULL,
    "description_fa" TEXT,
    "image" TEXT,
    "material" TEXT,
    "year" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_works_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postal_code" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total_toman" INTEGER NOT NULL,
    "authority" TEXT,
    "ref_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "name_fa" TEXT NOT NULL,
    "price_toman" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "variant_label" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "packages_slug_key" ON "packages"("slug");

-- CreateIndex
CREATE INDEX "package_items_package_id_idx" ON "package_items"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_phone_idx" ON "orders"("customer_phone");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "otp_codes_phone_idx" ON "otp_codes"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_items" ADD CONSTRAINT "package_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
