import { z } from "zod";
import { type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  wishlistItemCreateSchema,
  wishlistItemSchema,
  wishlistSearchSchema,
} from "~/schemas/wishlist";

export const wishlistRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(wishlistSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      // Build the where clause for the query
      const where: Prisma.WishlistItemWhereInput = {
        userId: ctx.session.user.id,
      };

      // Add search functionality
      if (input?.query) {
        where.OR = [
          { name: { contains: input.query, mode: "insensitive" } },
          { subtitle: { contains: input.query, mode: "insensitive" } },
          { isbn: { contains: input.query, mode: "insensitive" } },
          {
            wishlistItemAuthors: {
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
        where.wishlistItemAuthors = {
          some: {
            authorId: input.authorId,
          },
        };
      }

      if (input?.seriesId) {
        where.seriesId = input.seriesId;
      }

      // Get pagination parameters
      const page = input?.pagination?.page ?? 1;
      const pageSize = input?.pagination?.pageSize ?? 12;
      const skip = (page - 1) * pageSize;

      // Get total count for pagination
      const totalCount = await ctx.db.wishlistItem.count({ where });
      const totalPages = Math.ceil(totalCount / pageSize);

      // Define the order by clause based on sort options
      const orderBy: Prisma.WishlistItemOrderByWithRelationInput[] = [];

      // Set up sorting based on input params or default to createdAt desc
      const sortBy = input?.sortBy ?? "createdAt";
      const sortOrder = input?.sortOrder ?? "desc";

      switch (sortBy) {
        case "name":
          orderBy.push({ name: sortOrder });
          break;
        case "author":
          /*
           * Unfortunately Prisma doesn't have great support for sorting by related many-to-many relationships
           * We'll use a simple approach of sorting by first author relationship
           */
          orderBy.push({
            wishlistItemAuthors: {
              _count: sortOrder,
            },
          });
          // Secondary sort by name to ensure consistent results
          orderBy.push({ name: "asc" });
          break;
        case "series":
          // Books with series come first (non-null seriesId)
          orderBy.push({ seriesId: "asc" });
          // Then sort by series name
          orderBy.push({ series: { name: sortOrder } });
          // Then by series number (nulls come last)
          orderBy.push({
            seriesNumber: {
              sort: sortOrder,
              nulls: "last",
            },
          });
          break;
        case "createdAt":
        default:
          orderBy.push({ createdAt: sortOrder });
          break;
      }

      // Always add a secondary sort by name to ensure consistent ordering
      if (sortBy !== "name") {
        orderBy.push({ name: "asc" });
      }

      // Fetch the wishlist items
      const wishlistItems = await ctx.db.wishlistItem.findMany({
        where,
        orderBy,
        include: {
          wishlistItemAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
        },
        skip,
        take: pageSize,
      });

      return {
        wishlistItems,
        pagination: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          pageSize,
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get the wishlist item by ID with all related data
      const wishlistItem = await ctx.db.wishlistItem.findUnique({
        where: { id: input.id },
        include: {
          wishlistItemAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
        },
      });

      // Check if the wishlist item exists and belongs to the current user
      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }

      if (wishlistItem.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this wishlist item",
        });
      }

      return wishlistItem;
    }),

  create: protectedProcedure
    .input(wishlistItemCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookAuthors, seriesId, newSeriesName, ...rest } = input;

      // If newSeriesName is provided, first create the series
      let resolvedSeriesId = seriesId;
      if (newSeriesName && !seriesId) {
        // Create or find the series first
        const series = await ctx.db.series.create({
          data: {
            name: newSeriesName,
            userId: ctx.session.user.id,
          },
        });
        resolvedSeriesId = series.id;
      }

      // Create the wishlist item with relationships
      return ctx.db.wishlistItem.create({
        data: {
          ...rest,
          wishlistItemAuthors: {
            create: bookAuthors.map(({ authorId, tag }) => ({
              author: { connect: { id: authorId } },
              tag: tag ?? null,
            })),
          },
          // Connect to series if we have an ID
          ...(resolvedSeriesId
            ? { series: { connect: { id: resolvedSeriesId } } }
            : {}),
          user: { connect: { id: ctx.session.user.id } },
        },
        include: {
          wishlistItemAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
        },
      });
    }),

  update: protectedProcedure
    .input(wishlistItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, bookAuthors, seriesId, newSeriesName, ...rest } = input;

      // Check if the wishlist item belongs to the current user
      const wishlistItem = await ctx.db.wishlistItem.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (wishlistItem.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this wishlist item",
        });
      }

      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }

      // If newSeriesName is provided, first create the series
      let resolvedSeriesId = seriesId;
      if (newSeriesName && !seriesId) {
        // Create or find the series first
        const series = await ctx.db.series.create({
          data: {
            name: newSeriesName,
            userId: ctx.session.user.id,
          },
        });
        resolvedSeriesId = series.id;
      }

      // First delete existing wishlist item-author relationships
      await ctx.db.wishlistItemAuthorRelation.deleteMany({
        where: { wishlistItemId: id },
      });

      // Then update the wishlist item with new relationships
      return ctx.db.wishlistItem.update({
        where: { id },
        data: {
          ...rest,
          wishlistItemAuthors: {
            create: bookAuthors.map(({ authorId, tag }) => ({
              author: { connect: { id: authorId } },
              tag: tag ?? null,
            })),
          },
          ...(resolvedSeriesId
            ? { series: { connect: { id: resolvedSeriesId } } }
            : {}),
        },
        include: {
          wishlistItemAuthors: {
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
      // Check if wishlist item exists and belongs to the current user
      const wishlistItem = await ctx.db.wishlistItem.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (wishlistItem.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this wishlist item",
        });
      }

      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }

      // First delete all wishlist item-author relationships
      await ctx.db.wishlistItemAuthorRelation.deleteMany({
        where: { wishlistItemId: input.id },
      });

      // Then delete the wishlist item
      return ctx.db.wishlistItem.delete({
        where: { id: input.id },
      });
    }),

  moveToBooks: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the wishlist item with all of its relations
      const wishlistItem = await ctx.db.wishlistItem.findUnique({
        where: { id: input.id },
        include: {
          wishlistItemAuthors: {
            include: {
              author: true,
            },
          },
          series: true,
        },
      });

      if (wishlistItem.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to move this wishlist item",
        });
      }

      if (!wishlistItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Wishlist item not found",
        });
      }

      // Create a new book using the wishlist item data
      const newBook = await ctx.db.book.create({
        data: {
          isbn: wishlistItem.isbn,
          name: wishlistItem.name,
          subtitle: wishlistItem.subtitle,
          publisher: wishlistItem.publisher,
          pages: wishlistItem.pages,
          seriesId: wishlistItem.seriesId,
          seriesNumber: wishlistItem.seriesNumber,
          coverUrl: wishlistItem.coverUrl,
          userId: ctx.session.user.id,
          // Creation date is set to now by default
          bookAuthors: {
            create: wishlistItem.wishlistItemAuthors.map((wia) => ({
              author: { connect: { id: wia.authorId } },
              tag: wia.tag,
            })),
          },
        },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
        },
      });

      // Delete the wishlist item now that we've moved it to books
      await ctx.db.wishlistItemAuthorRelation.deleteMany({
        where: { wishlistItemId: wishlistItem.id },
      });

      await ctx.db.wishlistItem.delete({
        where: { id: wishlistItem.id },
      });

      return newBook;
    }),
});
