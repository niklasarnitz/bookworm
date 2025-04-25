import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  searchBooksByIsbn,
  getBookDetailFromAmazon,
} from "~/lib/amazon-scraper";

export const amazonRouter = createTRPCRouter({
  searchByIsbn: publicProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        const results = await searchBooksByIsbn(input.isbn);
        return { success: true, results };
      } catch (error) {
        console.error("Error searching Amazon books:", error);
        return {
          success: false,
          error: "Failed to search for books on Amazon",
        };
      }
    }),

  getBookDetail: publicProcedure
    .input(z.object({ detailUrl: z.string().url() }))
    .query(async ({ input }) => {
      try {
        const bookDetail = await getBookDetailFromAmazon(input.detailUrl);
        return { success: true, bookDetail };
      } catch (error) {
        console.error("Error fetching book details:", error);
        return {
          success: false,
          error: "Failed to fetch book details from Amazon",
        };
      }
    }),

  getCoverByIsbn: publicProcedure
    .input(z.object({ isbn: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        // First search for the book by ISBN
        const searchResults = await searchBooksByIsbn(input.isbn);

        if (searchResults.length === 0) {
          return { success: false, error: "No books found with this ISBN" };
        }

        // Get details for the first 5 books to find covers
        const coverResults = await Promise.all(
          searchResults.slice(0, 5).map(async (book) => {
            try {
              const details = await getBookDetailFromAmazon(book.detailUrl);
              if (details.coverImageUrl) {
                return {
                  title: details.title,
                  author: details.authors.join(", "),
                  coverUrl: details.coverImageUrl,
                };
              }
              return null;
            } catch (error) {
              console.error("Error fetching book details:", error);
              return null;
            }
          }),
        );

        const validCovers = coverResults.filter(Boolean);

        return {
          success: true,
          covers: validCovers,
        };
      } catch (error) {
        console.error("Error fetching covers:", error);
        return {
          success: false,
          error: "Failed to fetch covers from Amazon",
        };
      }
    }),
});
