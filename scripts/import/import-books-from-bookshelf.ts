import fs from "fs";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function importBooks(csvFilePath: string, userId: string) {
  console.log(`Importing books from ${csvFilePath}...`);

  if (!userId) {
    console.error("Error: You must provide a valid user ID");
    return;
  }

  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    quote: '"',
    delimiter: ",",
  });

  console.log(`Found ${records.length} records to import`);

  const authorCache: Record<string, string> = {};

  for (const [index, record] of records.entries()) {
    try {
      console.log(
        `Processing record ${index + 1}/${records.length}: ${record.Title}`,
      );

      const {
        "Book Id": bookId,
        ISBN: isbn,
        Title: name,
        Subtitle: subtitle,
        Authors: authors,
        Publisher: publisher,
        "Page Count": pageCount,
        "Published At": publishedAt,
        Format: format,
        Series: series,
        Volume: volume,
        Categories: categories,
        Language: language,
        Tags: tags,
        "My Rating": rating,
        Review: review,
        Read: read,
        "Started Reading On": startedReadingOn,
        "Ended Reading On": endedReadingOn,
      } = record;

      const authorNames = authors
        ? authors
            .split(/[,;]/)
            .map((a: string) => a.trim())
            .filter(Boolean)
        : [];

      if (authorNames.length === 0) {
        console.log(`Skipping book '${name}': No authors found`);
        continue;
      }

      const bookAuthors = await Promise.all(
        authorNames.map(async (authorName: string) => {
          if (!authorCache[authorName]) {
            let author = await prisma.author.findFirst({
              where: { name: { equals: authorName, mode: "insensitive" } },
            });

            if (!author) {
              author = await prisma.author.create({
                data: {
                  name: authorName,
                },
              });
              console.log(`Created new author: ${authorName}`);
            }
            authorCache[authorName] = author.id;
          }

          return { authorId: authorCache[authorName] };
        }),
      );

      const book = await prisma.book.create({
        data: {
          isbn: isbn || null,
          name,
          subtitle: subtitle || null,
          publisher: publisher || null,
          coverUrl: null,
          bookAuthors: {
            create: bookAuthors,
          },
          seriesNumber: volume ? parseFloat(volume) : null,
          userId,
        },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
        },
      });

      console.log(
        `Imported book: ${book.name} with ${book.bookAuthors.length} authors`,
      );
    } catch (error) {
      console.error(`Error processing record ${index + 1}:`, error);
    }
  }

  console.log("Import completed");
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.error(
        "Usage: bun run scripts/import/import-books.ts <path-to-csv-file> <user-id>",
      );
      process.exit(1);
    }

    const csvFilePath = args[0]!;

    if (!fs.existsSync(csvFilePath)) {
      console.error(`Error: CSV file not found: ${csvFilePath}`);
      process.exit(1);
    }

    await importBooks(csvFilePath, args[1]!);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
