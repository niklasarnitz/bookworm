/*
  Warnings:

  - You are about to drop the `AudioTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MediaRelease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhysicalItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subtitle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TvSeason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TvSeasonRelease` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TvShow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AudioTrack" DROP CONSTRAINT "AudioTrack_physicalItemId_fkey";

-- DropForeignKey
ALTER TABLE "MediaRelease" DROP CONSTRAINT "MediaRelease_movieId_fkey";

-- DropForeignKey
ALTER TABLE "MediaRelease" DROP CONSTRAINT "MediaRelease_userId_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_userId_fkey";

-- DropForeignKey
ALTER TABLE "PhysicalItem" DROP CONSTRAINT "PhysicalItem_mediaReleaseId_fkey";

-- DropForeignKey
ALTER TABLE "PhysicalItem" DROP CONSTRAINT "PhysicalItem_tvSeasonReleaseId_fkey";

-- DropForeignKey
ALTER TABLE "Subtitle" DROP CONSTRAINT "Subtitle_physicalItemId_fkey";

-- DropForeignKey
ALTER TABLE "TvSeason" DROP CONSTRAINT "TvSeason_tvShowId_fkey";

-- DropForeignKey
ALTER TABLE "TvSeason" DROP CONSTRAINT "TvSeason_userId_fkey";

-- DropForeignKey
ALTER TABLE "TvSeasonRelease" DROP CONSTRAINT "TvSeasonRelease_tvSeasonId_fkey";

-- DropForeignKey
ALTER TABLE "TvSeasonRelease" DROP CONSTRAINT "TvSeasonRelease_userId_fkey";

-- DropForeignKey
ALTER TABLE "TvShow" DROP CONSTRAINT "TvShow_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "TvShow" DROP CONSTRAINT "TvShow_userId_fkey";

-- DropTable
DROP TABLE "AudioTrack";

-- DropTable
DROP TABLE "MediaRelease";

-- DropTable
DROP TABLE "Movie";

-- DropTable
DROP TABLE "PhysicalItem";

-- DropTable
DROP TABLE "Subtitle";

-- DropTable
DROP TABLE "TvSeason";

-- DropTable
DROP TABLE "TvSeasonRelease";

-- DropTable
DROP TABLE "TvShow";
