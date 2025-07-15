import { READ_DATE_MINIMUM_DATE } from "~/server/api/routers/embeddable";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const statisticsRouter = createTRPCRouter({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get total books count
      const totalBooks = await ctx.db.book.count({
        where: {
          userId: ctx.session.user.id,
        },
      });

      // Get total read books count
      const readBooks = await ctx.db.book.count({
        where: {
          userId: ctx.session.user.id,
          readDate: {
            not: null,
          },
        },
      });

      // Get total authors count
      const totalAuthors = await ctx.db.author.count({
        where: {
          userId: ctx.session.user.id,
        },
      });

      // Get total categories count
      const totalCategories = await ctx.db.category.count({
        where: {
          userId: ctx.session.user.id,
        },
      });

      // Get total series count
      const totalSeries = await ctx.db.series.count({
        where: {
          userId: ctx.session.user.id,
        },
      });

      return {
        totalBooks,
        readBooks,
        totalAuthors,
        totalCategories,
        totalSeries,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch summary statistics\n" + JSON.stringify(error),
      });
    }
  }),

  getReadingProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get books read over time, grouped by month
      const readBooks = await ctx.db.book.findMany({
        where: {
          userId: ctx.session.user.id,
          readDate: {
            not: null,
            gt: READ_DATE_MINIMUM_DATE,
          },
        },
        select: {
          readDate: true,
        },
        orderBy: {
          readDate: "asc",
        },
      });

      // Process data to create a time series
      const monthlyData = readBooks.reduce(
        (acc, book) => {
          if (!book.readDate) return acc;

          const date = new Date(book.readDate);
          const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;

          acc[yearMonth] ??= 0;
          acc[yearMonth]++;

          return acc;
        },
        {} as Record<string, number>,
      );

      // Convert to array format for charts
      const monthlyReadingProgress = Object.entries(monthlyData).map(
        ([date, count]) => ({
          date,
          count,
        }),
      );

      return monthlyReadingProgress;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to fetch reading progress data\n" + JSON.stringify(error),
      });
    }
  }),

  getCategoryDistribution: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get book count by category
      const categories = await ctx.db.category.findMany({
        where: {
          userId: ctx.session.user.id,
          books: {
            some: {}, // Only categories that have books
          },
        },
        select: {
          id: true,
          name: true,
          path: true,
          _count: {
            select: {
              books: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        categories: categories.map((category) => ({
          name: category.name,
          count: category._count.books,
          path: category.path,
        })),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to fetch category distribution data\n" +
          JSON.stringify(error, null, 2),
      });
    }
  }),

  getPageCountStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get books with page counts
      const booksWithPages = await ctx.db.book.findMany({
        where: {
          userId: ctx.session.user.id,
          pages: {
            not: null,
          },
        },
        select: {
          pages: true,
          readDate: true,
        },
      });

      // Calculate total pages and total read pages
      const totalPages = booksWithPages.reduce(
        (sum, book) => sum + (book.pages ?? 0),
        0,
      );
      const readPages = booksWithPages
        .filter((book) => book.readDate !== null)
        .reduce((sum, book) => sum + (book.pages ?? 0), 0);

      // Count books without page information
      const booksWithoutPages = await ctx.db.book.count({
        where: {
          userId: ctx.session.user.id,
          pages: null,
        },
      });

      return {
        totalPages,
        readPages,
        booksWithPages: booksWithPages.length,
        booksWithoutPages,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "Failed to fetch page count statistics\n " + JSON.stringify(error),
      });
    }
  }),
});
