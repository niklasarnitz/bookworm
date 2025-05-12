import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "./trpc";
import { quoteSchema } from "~/schemas/quote";

export const quoteRouter = createTRPCRouter({
  getBookQuotes: protectedProcedure
    .input(z.object({ bookId: z.string() }))
    .query(async ({ ctx, input }) => {
      const quotes = await ctx.db.quote.findMany({
        where: {
          bookId: input.bookId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          pageStart: "asc",
        },
      });
      return { quotes };
    }),

  create: protectedProcedure
    .input(quoteSchema)
    .mutation(async ({ ctx, input }) => {
      const { bookId, ...quoteData } = input;

      return ctx.db.quote.create({
        data: {
          ...quoteData,
          book: {
            connect: { id: bookId },
          },
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(quoteSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, bookId, ...quoteData } = input;

      return ctx.db.quote.update({
        where: {
          id,
          userId: ctx.session.user.id,
        },
        data: quoteData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.quote.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
