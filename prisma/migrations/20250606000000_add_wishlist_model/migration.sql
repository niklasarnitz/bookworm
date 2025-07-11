-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "isbn" TEXT,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "publisher" TEXT,
    "pages" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "seriesId" TEXT,
    "seriesNumber" DOUBLE PRECISION,
    "coverUrl" TEXT,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItemAuthorRelation" (
    "id" TEXT NOT NULL,
    "wishlistItemId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tag" TEXT,

    CONSTRAINT "WishlistItemAuthorRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WishlistItem_name_idx" ON "WishlistItem"("name");

-- CreateIndex
CREATE INDEX "WishlistItem_seriesId_idx" ON "WishlistItem"("seriesId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItemAuthorRelation_wishlistItemId_authorId_key" ON "WishlistItemAuthorRelation"("wishlistItemId", "authorId");

-- CreateIndex
CREATE INDEX "WishlistItemAuthorRelation_wishlistItemId_idx" ON "WishlistItemAuthorRelation"("wishlistItemId");

-- CreateIndex
CREATE INDEX "WishlistItemAuthorRelation_authorId_idx" ON "WishlistItemAuthorRelation"("authorId");

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItemAuthorRelation" ADD CONSTRAINT "WishlistItemAuthorRelation_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "WishlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItemAuthorRelation" ADD CONSTRAINT "WishlistItemAuthorRelation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
