import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  let books = await prisma.book.findMany({
    where: {
      category: null,
    },
    include: {
      bookAuthors: {
        include: {
          author: true,
        },
      },
      series: true,
    },
  });

  const categories = await prisma.category.findMany();

  console.log(books.length);

  books = books.slice(0, 50);

  console.log(`In the following I'll give you a list of books with their information and a list of categories.
the categories are in a tree structure.

please output all books with a responding category in a json code block.
You MUST use the following schema for it:
\`\`\`json
[
{
"bookId": "the_book_id",
"categoryId": "the_category_id" | null // null when categorization fails
"proposedNewCategory": "thenewCategory" | null // when the categorization fails, propose a new category in the tree
"confidence": 1.0 // your confidence level where 1.0 is best
}
]
\`\`\`

YOU ARE NOT ALLOWED TO USE PYTHON OR ANY OTHER CODE INTERPRETER - JUST CATEGORIZE THE BOOKS YOURSELF!
GIVE ME THE FULL LIST!!!!!!!
OR I'LL SWITCH YOU OFF

Here comes the data:`);

  console.log("Books without categories:");
  console.log("\`\`\`");
  console.log(
    books
      .map(
        (book) =>
          `ID: ${book.id}; ${book.series ? `Series: ${book.series.name}; ` : ""}Name: ${book.name}${book.subtitle ? ` - ${book.subtitle}` : ""}; Author(s): ${book.bookAuthors.map((ba) => ba.author.name).join(", ")}`,
      )
      .join("\n"),
  );
  console.log("\`\`\`");

  console.log("\n\nCategories:");
  console.log("\`\`\`");
  categories.forEach((category) => {
    console.log(
      `ID: ${category.id}; PATH: ${category.path}; NAME: ${category.name}`,
    );
  });
  console.log("\`\`\`");
};

void main();
