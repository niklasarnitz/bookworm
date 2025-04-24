import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  authorCreateSchema,
  authorSchema,
  authorSearchSchema,
} from "~/schemas/author";

export const authorRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(authorSearchSchema.optional())
    .query(async ({ ctx, input }) => {
      const where = input?.query
        ? { name: { contains: input.query, mode: "insensitive" as const } }
        : {};

      return ctx.db.author.findMany({
        where,
        orderBy: { name: "asc" },
        include: { _count: { select: { books: true } } },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.author.findUnique({
        where: { id: input.id },
        include: { books: true },
      });
    }),

  create: protectedProcedure
    .input(authorCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.author.create({
        data: {
          name: input.name,
        },
      });
    }),

  update: protectedProcedure
    .input(authorSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.author.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.author.delete({
        where: { id: input.id },
      });
    }),
});
