import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  seriesCreateSchema,
  seriesSchema,
  seriesSearchSchema,
} from "~/schemas/series";
import { TRPCError } from "@trpc/server";

export const seriesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(seriesSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const page = input?.pagination?.page ?? 1;
      const pageSize = input?.pagination?.pageSize ?? 10;
      const skip = (page - 1) * pageSize;

      const where = {
        // Add user filter to ensure users only see their own series
        userId: ctx.session.user.id,
        ...(input?.query
          ? { name: { contains: input.query, mode: "insensitive" as const } }
          : {}),
      };

      // Get total count for pagination
      const totalCount = await ctx.db.series.count({ where });
      const totalPages = Math.ceil(totalCount / pageSize);

      // Get paginated results
      const series = await ctx.db.series.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { books: true } } },
        skip,
        take: pageSize,
      });

      return {
        series,
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
      const series = await ctx.db.series.findUnique({
        where: { id: input.id },
        include: {
          books: {
            include: {
              bookAuthors: {
                include: {
                  author: true,
                },
              },
            },
            orderBy: { seriesNumber: "asc" },
          },
        },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      // Verify series belongs to current user
      if (series.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this series",
        });
      }

      return series;
    }),

  create: protectedProcedure
    .input(seriesCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.series.create({
        data: {
          name: input.name,
          userId: ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(seriesSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if series exists and belongs to current user
      const series = await ctx.db.series.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      if (series.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this series",
        });
      }

      return ctx.db.series.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if series exists and belongs to current user
      const series = await ctx.db.series.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      if (series.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this series",
        });
      }

      return ctx.db.series.delete({
        where: { id: input.id },
      });
    }),
});
