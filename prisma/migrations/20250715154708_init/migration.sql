-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('BOOK', 'MOVIE');

-- CreateEnum
CREATE TYPE "VideoFormat" AS ENUM ('DVD', 'BLURAY', 'BLURAY_4K', 'BLURAY_3D', 'LASERDISC', 'VHS', 'VCD');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isSharingReadingList" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "isbn" TEXT,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "seriesId" TEXT,
    "seriesNumber" DOUBLE PRECISION,
    "coverUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publisher" TEXT,
    "pages" INTEGER,
    "categoryId" TEXT,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',
    "readDate" TIMESTAMP(3),

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAuthorRelation" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "tag" TEXT,

    CONSTRAINT "BookAuthorRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'cm9vhjvpo0000btb9gdu2ny14',
    "mediaType" "MediaType" NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
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

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaRelease" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "editionName" TEXT,
    "releaseDate" TIMESTAMP(3),
    "countryOfRelease" TEXT,
    "upc" TEXT,
    "publisherNumber" TEXT,
    "asin" TEXT,
    "userId" TEXT NOT NULL,
    "distributor" TEXT,
    "publisher" TEXT,

    CONSTRAINT "MediaRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhysicalItem" (
    "id" TEXT NOT NULL,
    "mediaReleaseId" TEXT NOT NULL,
    "format" "VideoFormat" NOT NULL,
    "discName" TEXT,
    "discNumber" INTEGER,
    "aspectRatio" TEXT,
    "durationMinutes" INTEGER,

    CONSTRAINT "PhysicalItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" TEXT NOT NULL,
    "physicalItemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "codec" TEXT NOT NULL,
    "channels" TEXT NOT NULL,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtitle" (
    "id" TEXT NOT NULL,
    "physicalItemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "Subtitle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Book_name_idx" ON "Book"("name");

-- CreateIndex
CREATE INDEX "Book_seriesId_idx" ON "Book"("seriesId");

-- CreateIndex
CREATE INDEX "Book_categoryId_idx" ON "Book"("categoryId");

-- CreateIndex
CREATE INDEX "BookAuthorRelation_bookId_idx" ON "BookAuthorRelation"("bookId");

-- CreateIndex
CREATE INDEX "BookAuthorRelation_authorId_idx" ON "BookAuthorRelation"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAuthorRelation_bookId_authorId_key" ON "BookAuthorRelation"("bookId", "authorId");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "Author"("name");

-- CreateIndex
CREATE INDEX "Series_name_idx" ON "Series"("name");

-- CreateIndex
CREATE INDEX "Quote_bookId_idx" ON "Quote"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_path_key" ON "Category"("path");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_path_idx" ON "Category"("path");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_mediaType_idx" ON "Category"("mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_tmdbId_key" ON "Movie"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_imdbId_key" ON "Movie"("imdbId");

-- CreateIndex
CREATE INDEX "Movie_title_idx" ON "Movie"("title");

-- CreateIndex
CREATE INDEX "Movie_categoryId_idx" ON "Movie"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaRelease_upc_key" ON "MediaRelease"("upc");

-- CreateIndex
CREATE UNIQUE INDEX "MediaRelease_asin_key" ON "MediaRelease"("asin");

-- CreateIndex
CREATE INDEX "MediaRelease_movieId_idx" ON "MediaRelease"("movieId");

-- CreateIndex
CREATE INDEX "PhysicalItem_mediaReleaseId_idx" ON "PhysicalItem"("mediaReleaseId");

-- CreateIndex
CREATE INDEX "AudioTrack_physicalItemId_idx" ON "AudioTrack"("physicalItemId");

-- CreateIndex
CREATE INDEX "Subtitle_physicalItemId_idx" ON "Subtitle"("physicalItemId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthorRelation" ADD CONSTRAINT "BookAuthorRelation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAuthorRelation" ADD CONSTRAINT "BookAuthorRelation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Series" ADD CONSTRAINT "Series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelease" ADD CONSTRAINT "MediaRelease_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRelease" ADD CONSTRAINT "MediaRelease_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhysicalItem" ADD CONSTRAINT "PhysicalItem_mediaReleaseId_fkey" FOREIGN KEY ("mediaReleaseId") REFERENCES "MediaRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_physicalItemId_fkey" FOREIGN KEY ("physicalItemId") REFERENCES "PhysicalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtitle" ADD CONSTRAINT "Subtitle_physicalItemId_fkey" FOREIGN KEY ("physicalItemId") REFERENCES "PhysicalItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
