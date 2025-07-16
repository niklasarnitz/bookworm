-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'TV_SHOW';

-- AlterTable
ALTER TABLE "PhysicalItem" ADD COLUMN     "tvSeasonReleaseId" TEXT,
ALTER COLUMN "mediaReleaseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TvShow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originalReleaseYear" INTEGER NOT NULL,
    "plot" TEXT,
    "posterUrl" TEXT,
    "tmdbId" TEXT,
    "imdbId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TvShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TvSeason" (
    "id" TEXT NOT NULL,
    "tvShowId" TEXT NOT NULL,
    "seasonNumber" INTEGER NOT NULL,
    "title" TEXT,
    "releaseYear" INTEGER,
    "episodeCount" INTEGER,
    "plot" TEXT,
    "posterUrl" TEXT,
    "watchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TvSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TvSeasonRelease" (
    "id" TEXT NOT NULL,
    "tvSeasonId" TEXT NOT NULL,
    "editionName" TEXT,
    "releaseDate" TIMESTAMP(3),
    "countryOfRelease" TEXT,
    "upc" TEXT,
    "publisherNumber" TEXT,
    "asin" TEXT,
    "userId" TEXT NOT NULL,
    "distributor" TEXT,
    "publisher" TEXT,

    CONSTRAINT "TvSeasonRelease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TvShow_tmdbId_key" ON "TvShow"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "TvShow_imdbId_key" ON "TvShow"("imdbId");

-- CreateIndex
CREATE INDEX "TvShow_title_idx" ON "TvShow"("title");

-- CreateIndex
CREATE INDEX "TvShow_categoryId_idx" ON "TvShow"("categoryId");

-- CreateIndex
CREATE INDEX "TvSeason_tvShowId_idx" ON "TvSeason"("tvShowId");

-- CreateIndex
CREATE INDEX "TvSeason_watchedAt_idx" ON "TvSeason"("watchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TvSeason_tvShowId_seasonNumber_key" ON "TvSeason"("tvShowId", "seasonNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TvSeasonRelease_upc_key" ON "TvSeasonRelease"("upc");

-- CreateIndex
CREATE UNIQUE INDEX "TvSeasonRelease_asin_key" ON "TvSeasonRelease"("asin");

-- CreateIndex
CREATE INDEX "TvSeasonRelease_tvSeasonId_idx" ON "TvSeasonRelease"("tvSeasonId");

-- CreateIndex
CREATE INDEX "PhysicalItem_tvSeasonReleaseId_idx" ON "PhysicalItem"("tvSeasonReleaseId");

-- AddForeignKey
ALTER TABLE "TvShow" ADD CONSTRAINT "TvShow_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvShow" ADD CONSTRAINT "TvShow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvSeason" ADD CONSTRAINT "TvSeason_tvShowId_fkey" FOREIGN KEY ("tvShowId") REFERENCES "TvShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvSeason" ADD CONSTRAINT "TvSeason_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvSeasonRelease" ADD CONSTRAINT "TvSeasonRelease_tvSeasonId_fkey" FOREIGN KEY ("tvSeasonId") REFERENCES "TvSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TvSeasonRelease" ADD CONSTRAINT "TvSeasonRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalItem" ADD CONSTRAINT "PhysicalItem_tvSeasonReleaseId_fkey" FOREIGN KEY ("tvSeasonReleaseId") REFERENCES "TvSeasonRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
