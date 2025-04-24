import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  seriesCreateSchema,
  seriesSchema,
  seriesSearchSchema,
} from "~/schemas/series";

export const seriesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(seriesSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const where = input?.query
        ? { name: { contains: input.query, mode: "insensitive" as const } }
        : {};

      return ctx.db.series.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { books: true } } },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.series.findUnique({
        where: { id: input.id },
        include: {
          books: {
            include: { author: true },
            orderBy: { seriesNumber: "asc" },
          },
        },
      });
    }),

  create: protectedProcedure
    .input(seriesCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.series.create({
        data: { name: input.name },
      });
    }),

  update: protectedProcedure
    .input(seriesSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.series.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.series.delete({
        where: { id: input.id },
      });
    }),
});
