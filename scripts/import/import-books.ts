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

  // Read the CSV file
  const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

  // Parse the CSV content
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    quote: '"',
    delimiter: ",",
  });

  console.log(`Found ${records.length} records to import`);

  // Create a map to track authors we've already created
  const authorCache: Record<string, string> = {};

  // Process each record
  for (const [index, record] of records.entries()) {
    try {
      console.log(
        `Processing record ${index + 1}/${records.length}: ${record.Title}`,
      );

      // Extract relevant fields from the record
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

      // Handle authors - split by comma or semicolon if multiple
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

      // Create or get the author IDs
      const bookAuthors = await Promise.all(
        authorNames.map(async (authorName: string) => {
          // Check if we've already processed this author
          if (!authorCache[authorName]) {
            // Check if author exists in database
            let author = await prisma.author.findFirst({
              where: { name: { equals: authorName, mode: "insensitive" } },
            });

            // Create author if not exists
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

      // Create the book
      const book = await prisma.book.create({
        data: {
          isbn: isbn || null,
          name,
          subtitle: subtitle || null,
          publisher: publisher || null,
          coverUrl: null, // You might want to handle cover uploads separately
          bookAuthors: {
            create: bookAuthors,
          },
          // Add seriesId and seriesNumber if needed - for now skipped as you mentioned series will be done manually
          seriesNumber: volume ? parseFloat(volume) : null,
          createdById: userId,
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

// Main function to run the import
async function main() {
  try {
    // Check for command line arguments
    const args = process.argv.slice(2);

    if (args.length < 2) {
      console.error(
        "Usage: bun run scripts/import/import-books.ts <path-to-csv-file> <user-id>",
      );
      process.exit(1);
    }

    const csvFilePath = args[0]!;

    // Validate the CSV file path
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

// Run the script
void main();
