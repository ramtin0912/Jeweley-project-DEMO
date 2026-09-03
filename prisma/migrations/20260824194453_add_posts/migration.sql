-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "title_fa" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_md" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
