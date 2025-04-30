import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { bookCreateSchema, bookSchema, bookSearchSchema } from "~/schemas/book";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const bookRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(bookSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const page = input?.pagination?.page ?? 1;
      const pageSize = input?.pagination?.pageSize ?? 12;
      const skip = (page - 1) * pageSize;

      // Build where clause based on search parameters
      const where: Prisma.BookWhereInput = {
        // Add user filter to ensure users only see their own books
        userId: ctx.session.user.id,
      };

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
          {
            series: {
              name: { contains: input.query, mode: "insensitive" },
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

      if (input?.onlyRead) {
        where.readDate = { not: null };
      }

      // Get total count for pagination
      const totalCount = await ctx.db.book.count({ where });
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get paginated results
      const books = await ctx.db.book.findMany({
        where,
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
          category: {
            include: {
              _count: {
                select: {
                  books: true,
                },
              },
            },
          },
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
        ...(input?.pagination ? { skip, take: pageSize } : {}),
      });

      return {
        books,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
          category: {
            include: {
              _count: {
                select: {
                  books: true,
                },
              },
            },
          },
        },
      });

      // Check if book exists and belongs to the current user
      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this book",
        });
      }

      return book;
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
            userId: ctx.session.user.id, // Add user ID
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

      // Check if the book belongs to the current user
      const book = await ctx.db.book.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this book",
        });
      }

      // If newSeriesName is provided, first create the series
      let resolvedSeriesId = seriesId;
      if (newSeriesName && !seriesId) {
        // Create or find the series first
        const series = await ctx.db.series.create({
          data: {
            name: newSeriesName,
            userId: ctx.session.user.id, // Add user ID
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
      // Check if book exists and belongs to the current user
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this book",
        });
      }

      // First delete all book-author relationships
      await ctx.db.bookAuthorRelation.deleteMany({
        where: { bookId: input.id },
      });

      // Then delete the book
      return ctx.db.book.delete({
        where: { id: input.id },
      });
    }),

  toggleReadStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if book exists and belongs to the current user
      const book = await ctx.db.book.findUnique({
        where: { id: input.id },
        select: { userId: true, readDate: true },
      });

      if (!book) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Book not found",
        });
      }

      if (book.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this book",
        });
      }

      // Toggle read status: If readDate is null, set to current date, otherwise set to null
      const readDate = book.readDate ? null : new Date();

      // Update the book with the new read status
      return ctx.db.book.update({
        where: { id: input.id },
        data: { readDate },
      });
    }),
});
