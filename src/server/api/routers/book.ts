import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { bookCreateSchema, bookSchema, bookSearchSchema } from "~/schemas/book";
import { type Prisma } from "@prisma/client";

export const bookRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(bookSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      // Build where clause based on search parameters
      const where: Prisma.BookWhereInput = {};

      if (input?.query) {
        where.OR = [
          { name: { contains: input.query, mode: "insensitive" } },
          { subtitle: { contains: input.query, mode: "insensitive" } },
          { isbn: { contains: input.query, mode: "insensitive" } },
          {
            bookAuthors: {
              some: {
                author: {
                  name: { contains: input.query, mode: "insensitive" },
                },
              },
            },
          },
        ];
      }

      if (input?.authorId) {
        where.bookAuthors = {
          some: {
            authorId: input.authorId,
          },
        };
      }

      if (input?.seriesId) {
        where.seriesId = input.seriesId;
      }

      if (input?.categoryId) {
        where.categoryId = input.categoryId;
      }

      if (input?.noCover) {
        where.coverUrl = null;
      }

      if (input?.noCategory) {
        where.categoryId = null;
      }

      return ctx.db.book.findMany({
        where,
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
          category: true,
        },
        orderBy: [
          // Books with series come first (non-null seriesId)
          { seriesId: "asc" },
          // Then sort by series name
          { series: { name: "asc" } },
          // Then by series number (nulls come last)
          {
            seriesNumber: {
              sort: "asc",
              nulls: "last",
            },
          },
          // Finally, sort by book name
          { name: "asc" },
        ],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.book.findUnique({
        where: { id: input.id },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
          category: true,
        },
      });
    }),

  create: protectedProcedure
    .input(bookCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookAuthors, seriesId, newSeriesName, categoryId, ...rest } =
        input;

      // If newSeriesName is provided, first create the series
      let resolvedSeriesId = seriesId;
      if (newSeriesName && !seriesId) {
        // Create or find the series first
        const series = await ctx.db.series.create({
          data: {
            name: newSeriesName,
          },
        });
        resolvedSeriesId = series.id;
      }

      // Create the book with relationships
      return ctx.db.book.create({
        data: {
          ...rest,
          bookAuthors: {
            create: bookAuthors.map(({ authorId, tag }) => ({
              author: { connect: { id: authorId } },
              tag: tag ?? null,
            })),
          },
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          // Connect to series if we have an ID
          ...(resolvedSeriesId
            ? { series: { connect: { id: resolvedSeriesId } } }
            : {}),
          user: { connect: { id: ctx.session.user.id } },
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
    }),

  update: protectedProcedure
    .input(bookSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, bookAuthors, seriesId, newSeriesName, categoryId, ...rest } =
        input;

      // If newSeriesName is provided, first create the series
      let resolvedSeriesId = seriesId;
      if (newSeriesName && !seriesId) {
        // Create or find the series first
        const series = await ctx.db.series.create({
          data: {
            name: newSeriesName,
          },
        });
        resolvedSeriesId = series.id;
      }

      // First delete existing book-author relationships
      await ctx.db.bookAuthorRelation.deleteMany({
        where: { bookId: id },
      });

      // Then update the book with new relationships
      return ctx.db.book.update({
        where: { id },
        data: {
          ...rest,
          bookAuthors: {
            create: bookAuthors.map(({ authorId, tag }) => ({
              author: { connect: { id: authorId } },
              tag: tag ?? null,
            })),
          },
          ...(resolvedSeriesId
            ? { series: { connect: { id: resolvedSeriesId } } }
            : {}),
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
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
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First delete all book-author relationships
      await ctx.db.bookAuthorRelation.deleteMany({
        where: { bookId: input.id },
      });

      // Then delete the book
      return ctx.db.book.delete({
        where: { id: input.id },
      });
    }),
});
