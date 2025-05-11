import type { URecord } from "@ainias42/js-helper";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const embeddableRouter = createTRPCRouter({
  getReadingList: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: {
          username: input.username,
        },
      });

      if (!user?.isSharingReadingList) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is not sharing their reading list or does not exist",
        });
      }

      const books = await ctx.db.book.findMany({
        where: {
          userId: user.id,
          readDate: {
            gt: new Date(new Date().setFullYear(1900, 1, 1)),
          },
        },
        orderBy: {
          readDate: "desc",
        },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
        },
      });

      return books.reduce(
        (acc, book) => {
          const year = book.readDate?.getFullYear();
          if (year) {
            acc[year] ??= [];
            acc[year].push(book);
          }
          return acc;
        },
        {} as URecord<string, typeof books>,
      );
    }),
});
