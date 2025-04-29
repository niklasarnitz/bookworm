import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  authorCreateSchema,
  authorSchema,
  authorSearchSchema,
} from "~/schemas/author";
import { TRPCError } from "@trpc/server";

export const authorRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(authorSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const page = input?.pagination?.page ?? 1;
      const pageSize = input?.pagination?.pageSize ?? 20;
      const skip = (page - 1) * pageSize;

      const where = {
        // Add user filter to ensure users only see their own authors
        userId: ctx.session.user.id,
        ...(input?.query
          ? { name: { contains: input.query, mode: "insensitive" as const } }
          : {}),
      };

      // Get total count for pagination
      const totalCount = await ctx.db.author.count({ where });
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get paginated results
      const authors = await ctx.db.author.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { books: true } } },
        skip,
        take: pageSize,
      });

      return {
        authors,
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
      const author = await ctx.db.author.findUnique({
        where: { id: input.id },
        include: { books: true },
      });

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      // Verify author belongs to current user
      if (author.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this author",
        });
      }

      return author;
    }),

  create: protectedProcedure
    .input(authorCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.author.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(authorSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if author exists and belongs to the current user
      const author = await ctx.db.author.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      if (author.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this author",
        });
      }

      return ctx.db.author.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if author exists and belongs to current user
      const author = await ctx.db.author.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!author) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Author not found",
        });
      }

      if (author.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this author",
        });
      }

      return ctx.db.author.delete({
        where: { id: input.id },
      });
    }),
});
