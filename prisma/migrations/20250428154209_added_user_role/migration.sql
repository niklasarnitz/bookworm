-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "userId" SET DEFAULT 'cm9vhjvpo0000btb9gdu2ny14';

-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "userId" SET DEFAULT 'cm9vhjvpo0000btb9gdu2ny14';

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "userId" SET DEFAULT 'cm9vhjvpo0000btb9gdu2ny14';

-- AlterTable
ALTER TABLE "Series" ALTER COLUMN "userId" SET DEFAULT 'cm9vhjvpo0000btb9gdu2ny14';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
