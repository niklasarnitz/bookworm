import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createMediaReleaseSchema,
  updateMediaReleaseSchema,
  createPhysicalItemSchema,
  updatePhysicalItemSchema,
  createAudioTrackSchema,
  updateAudioTrackSchema,
  createSubtitleSchema,
  updateSubtitleSchema,
} from "~/schemas/video";

export const mediaReleaseRouter = createTRPCRouter({
  // Get all releases for a movie
  getByMovieId: protectedProcedure
    .input(z.object({ movieId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify the user owns the movie
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.movieId,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new Error("Movie not found");
      }

      return ctx.db.mediaRelease.findMany({
        where: { movieId: input.movieId },
        include: {
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
        orderBy: { releaseDate: "desc" },
      });
    }),

  // Get a single release by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const release = await ctx.db.mediaRelease.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          movie: true,
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });

      if (!release) {
        throw new Error("Media release not found");
      }

      return release;
    }),

  // Create a new media release
  create: protectedProcedure
    .input(createMediaReleaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns the movie
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.movieId,
          userId: ctx.session.user.id,
        },
      });

      if (!movie) {
        throw new Error("Movie not found");
      }

      return ctx.db.mediaRelease.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          movie: true,
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });
    }),

  // Update a media release
  update: protectedProcedure
    .input(updateMediaReleaseSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingRelease = await ctx.db.mediaRelease.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingRelease) {
        throw new Error("Media release not found");
      }

      return ctx.db.mediaRelease.update({
        where: { id },
        data: updateData,
        include: {
          movie: true,
          items: {
            include: {
              audioTracks: true,
              subtitles: true,
            },
          },
        },
      });
    }),

  // Delete a media release
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingRelease = await ctx.db.mediaRelease.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingRelease) {
        throw new Error("Media release not found");
      }

      return ctx.db.mediaRelease.delete({
        where: { id: input.id },
      });
    }),

  // Add a physical item to a release
  addPhysicalItem: protectedProcedure
    .input(createPhysicalItemSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the user owns the media release
      const release = await ctx.db.mediaRelease.findFirst({
        where: {
          id: input.mediaReleaseId,
          userId: ctx.session.user.id,
        },
      });

      if (!release) {
        throw new Error("Media release not found");
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
    .input(updatePhysicalItemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership through the release
      const existingItem = await ctx.db.physicalItem.findFirst({
        where: {
          id,
          mediaRelease: {
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

  // Delete a physical item
  deletePhysicalItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the release
      const existingItem = await ctx.db.physicalItem.findFirst({
        where: {
          id: input.id,
          mediaRelease: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!existingItem) {
        throw new Error("Physical item not found");
      }

      return ctx.db.physicalItem.delete({
        where: { id: input.id },
      });
    }),

  // Add audio track to physical item
  addAudioTrack: protectedProcedure
    .input(createAudioTrackSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the physical item -> media release chain
      const existingItem = await ctx.db.physicalItem.findFirst({
        where: {
          id: input.physicalItemId,
          mediaRelease: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!existingItem) {
        throw new Error("Physical item not found");
      }

      return ctx.db.audioTrack.create({
        data: input,
      });
    }),

  // Update audio track
  updateAudioTrack: protectedProcedure
    .input(updateAudioTrackSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership through the physical item -> media release chain
      const existingTrack = await ctx.db.audioTrack.findFirst({
        where: {
          id,
          physicalItem: {
            mediaRelease: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!existingTrack) {
        throw new Error("Audio track not found");
      }

      return ctx.db.audioTrack.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete audio track
  deleteAudioTrack: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the physical item -> media release chain
      const existingTrack = await ctx.db.audioTrack.findFirst({
        where: {
          id: input.id,
          physicalItem: {
            mediaRelease: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!existingTrack) {
        throw new Error("Audio track not found");
      }

      return ctx.db.audioTrack.delete({
        where: { id: input.id },
      });
    }),

  // Add subtitle to physical item
  addSubtitle: protectedProcedure
    .input(createSubtitleSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the physical item -> media release chain
      const existingItem = await ctx.db.physicalItem.findFirst({
        where: {
          id: input.physicalItemId,
          mediaRelease: {
            userId: ctx.session.user.id,
          },
        },
      });

      if (!existingItem) {
        throw new Error("Physical item not found");
      }

      return ctx.db.subtitle.create({
        data: input,
      });
    }),

  // Update subtitle
  updateSubtitle: protectedProcedure
    .input(updateSubtitleSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership through the physical item -> media release chain
      const existingSubtitle = await ctx.db.subtitle.findFirst({
        where: {
          id,
          physicalItem: {
            mediaRelease: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!existingSubtitle) {
        throw new Error("Subtitle not found");
      }

      return ctx.db.subtitle.update({
        where: { id },
        data: updateData,
      });
    }),

  // Delete subtitle
  deleteSubtitle: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the physical item -> media release chain
      const existingSubtitle = await ctx.db.subtitle.findFirst({
        where: {
          id: input.id,
          physicalItem: {
            mediaRelease: {
              userId: ctx.session.user.id,
            },
          },
        },
      });

      if (!existingSubtitle) {
        throw new Error("Subtitle not found");
      }

      return ctx.db.subtitle.delete({
        where: { id: input.id },
      });
    }),
});
