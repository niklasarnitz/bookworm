/*
  Warnings:

  - You are about to drop the column `authorId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_authorId_fkey";

-- DropIndex
DROP INDEX "Book_authorId_idx";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "authorId";

-- CreateTable
CREATE TABLE "BookAuthorRelation" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tag" TEXT,

    CONSTRAINT "BookAuthorRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookAuthorRelation_bookId_idx" ON "BookAuthorRelation"("bookId");

-- CreateIndex
CREATE INDEX "BookAuthorRelation_authorId_idx" ON "BookAuthorRelation"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAuthorRelation_bookId_authorId_key" ON "BookAuthorRelation"("bookId", "authorId");

-- AddForeignKey
ALTER TABLE "BookAuthorRelation" ADD CONSTRAINT "BookAuthorRelation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthorRelation" ADD CONSTRAINT "BookAuthorRelation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
