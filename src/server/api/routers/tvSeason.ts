import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createTvSeasonSchema, updateTvSeasonSchema } from "~/schemas/tvShow";

export const tvSeasonRouter = createTRPCRouter({
  // Get all seasons for a specific TV show
  getByTvShowId: protectedProcedure
    .input(z.object({ tvShowId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tvSeason.findMany({
        where: {
          tvShowId: input.tvShowId,
          userId: ctx.session.user.id,
        },
        include: {
          releases: {
            include: {
              items: {
                include: {
                  audioTracks: true,
                  subtitles: true,
                },
              },
            },
          },
        },
        orderBy: { seasonNumber: "asc" },
      });
    }),

  // Get a single TV season by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const season = await ctx.db.tvSeason.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          tvShow: true,
          releases: {
            include: {
              items: {
                include: {
                  audioTracks: true,
                  subtitles: true,
                },
              },
            },
          },
        },
      });

      if (!season) {
        throw new Error("TV Season not found");
      }

      return season;
    }),

  // Create a new TV season
  create: protectedProcedure
    .input(createTvSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify TV show ownership
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.tvShowId,
          userId: ctx.session.user.id,
        },
      });

      if (!tvShow) {
        throw new Error("TV Show not found");
      }

      return ctx.db.tvSeason.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          tvShow: true,
          releases: {
            include: {
              items: {
                include: {
                  audioTracks: true,
                  subtitles: true,
                },
              },
            },
          },
        },
      });
    }),

  // Update a TV season
  update: protectedProcedure
    .input(updateTvSeasonSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingSeason = await ctx.db.tvSeason.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingSeason) {
        throw new Error("TV Season not found");
      }

      return ctx.db.tvSeason.update({
        where: { id },
        data: updateData,
        include: {
          tvShow: true,
          releases: {
            include: {
              items: {
                include: {
                  audioTracks: true,
                  subtitles: true,
                },
              },
            },
          },
        },
      });
    }),

  // Delete a TV season
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingSeason = await ctx.db.tvSeason.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingSeason) {
        throw new Error("TV Season not found");
      }

      return ctx.db.tvSeason.delete({
        where: { id: input.id },
      });
    }),

  // Toggle watched status for a season
  toggleWatched: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        watchedAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingSeason = await ctx.db.tvSeason.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingSeason) {
        throw new Error("TV Season not found");
      }

      return ctx.db.tvSeason.update({
        where: { id: input.id },
        data: {
          watchedAt: input.watchedAt,
        },
        include: {
          tvShow: true,
          releases: {
            include: {
              items: {
                include: {
                  audioTracks: true,
                  subtitles: true,
                },
              },
            },
          },
        },
      });
    }),
});
