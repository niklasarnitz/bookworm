import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createTvSeasonReleaseSchema,
  updateTvSeasonReleaseSchema,
  createTvPhysicalItemSchema,
  updateTvPhysicalItemSchema,
} from "~/schemas/tvShow";

export const tvSeasonReleaseRouter = createTRPCRouter({
  // Get all releases for a specific TV season
  getByTvSeasonId: protectedProcedure
    .input(z.object({ tvSeasonId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tvSeasonRelease.findMany({
        where: {
          tvSeasonId: input.tvSeasonId,
          userId: ctx.session.user.id,
        },
        include: {
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });
    }),

  // Get a single TV season release by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const release = await ctx.db.tvSeasonRelease.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          tvSeason: {
            include: {
              tvShow: true,
            },
          },
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });

      if (!release) {
        throw new Error("TV Season Release not found");
      }

      return release;
    }),

  // Create a new TV season release
  create: protectedProcedure
    .input(createTvSeasonReleaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify TV season ownership
      const tvSeason = await ctx.db.tvSeason.findFirst({
        where: {
          id: input.tvSeasonId,
          userId: ctx.session.user.id,
        },
      });

      if (!tvSeason) {
        throw new Error("TV Season not found");
      }

      return ctx.db.tvSeasonRelease.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          tvSeason: {
            include: {
              tvShow: true,
            },
          },
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });
    }),

  // Update a TV season release
  update: protectedProcedure
    .input(updateTvSeasonReleaseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingRelease = await ctx.db.tvSeasonRelease.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingRelease) {
        throw new Error("TV Season Release not found");
      }

      return ctx.db.tvSeasonRelease.update({
        where: { id },
        data: updateData,
        include: {
          tvSeason: {
            include: {
              tvShow: true,
            },
          },
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });
    }),

  // Delete a TV season release
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingRelease = await ctx.db.tvSeasonRelease.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingRelease) {
        throw new Error("TV Season Release not found");
      }

      return ctx.db.tvSeasonRelease.delete({
        where: { id: input.id },
      });
    }),

  // Add a physical item to a TV season release
  addPhysicalItem: protectedProcedure
    .input(createTvPhysicalItemSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns the TV season release
      const release = await ctx.db.tvSeasonRelease.findFirst({
        where: {
          id: input.tvSeasonReleaseId,
          userId: ctx.session.user.id,
        },
      });

      if (!release) {
        throw new Error("TV Season release not found");
      }

      return ctx.db.physicalItem.create({
        data: input,
        include: {
          audioTracks: true,
          subtitles: true,
        },
      });
    }),

  // Update a physical item
  updatePhysicalItem: protectedProcedure
    .input(updateTvPhysicalItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership through the release
      const existingItem = await ctx.db.physicalItem.findFirst({
        where: {
          id,
          tvSeasonRelease: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!existingItem) {
        throw new Error("Physical item not found");
      }

      return ctx.db.physicalItem.update({
        where: { id },
        data: updateData,
        include: {
          audioTracks: true,
          subtitles: true,
        },
      });
    }),
});
