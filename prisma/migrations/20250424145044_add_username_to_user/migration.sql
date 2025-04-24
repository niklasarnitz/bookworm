/*
  Warnings:

  - You are about to drop the column `createdById` on the `Author` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Author" DROP CONSTRAINT "Author_createdById_fkey";

-- AlterTable
ALTER TABLE "Author" DROP COLUMN "createdById";
