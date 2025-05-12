-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "pageStart" INTEGER NOT NULL,
    "pageEnd" INTEGER,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_bookId_idx" ON "Quote"("bookId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
