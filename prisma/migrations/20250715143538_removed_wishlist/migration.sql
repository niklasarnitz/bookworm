/*
  Warnings:

  - You are about to drop the `WishlistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WishlistItemAuthorRelation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_seriesId_fkey";

-- DropForeignKey
ALTER TABLE "WishlistItem" DROP CONSTRAINT "WishlistItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "WishlistItemAuthorRelation" DROP CONSTRAINT "WishlistItemAuthorRelation_authorId_fkey";

-- DropForeignKey
ALTER TABLE "WishlistItemAuthorRelation" DROP CONSTRAINT "WishlistItemAuthorRelation_wishlistItemId_fkey";

-- DropTable
DROP TABLE "WishlistItem";

-- DropTable
DROP TABLE "WishlistItemAuthorRelation";
