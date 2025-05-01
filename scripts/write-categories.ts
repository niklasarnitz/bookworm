import { PrismaClient } from "@prisma/client";
import booksAndCategories from "./booksAndCategories.json";

const db = new PrismaClient();

const main = async () => {
  await Promise.all(
    booksAndCategories.map(async (book) => {
      const newBook = await db.book.update({
        where: {
          id: book.bookId,
        },
        data: {
          categoryId: book.categoryId,
        },
        include: {
          category: true,
        },
      });
      console.log(
        `Updated book ${newBook.name} with category ${newBook.category?.name}`,
      );
    }),
  );
};

void main();
