-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "watchedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Movie_watchedAt_idx" ON "Movie"("watchedAt");
