import { db } from "../db";
import { revalidatePath } from "next/cache";
import type { QuoteFormValues } from "~/schemas/quote";
import { api } from "~/trpc/server";

export async function getBookQuotes(bookId: string) {
  const user = await api.userManagement.getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  return db.quote.findMany({
    where: {
      bookId,
      userId: user.id,
    },
    orderBy: {
      pageStart: "asc",
    },
  });
}

export async function createQuote(data: QuoteFormValues) {
  const user = await api.userManagement.getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { bookId, ...quoteData } = data;

  const quote = await db.quote.create({
    data: {
      ...quoteData,
      book: {
        connect: {
          id: bookId,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  revalidatePath(`/books/${bookId}`);
  return quote;
}

export async function updateQuote(id: string, data: QuoteFormValues) {
  const user = await api.userManagement.getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { bookId, ...quoteData } = data;

  const quote = await db.quote.update({
    where: {
      id,
      userId: user.id,
    },
    data: quoteData,
  });

  revalidatePath(`/books/${bookId}`);
  return quote;
}

export async function deleteQuote(id: string, bookId: string) {
  const user = await api.userManagement.getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  await db.quote.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath(`/books/${bookId}`);
}
