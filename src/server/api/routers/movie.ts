import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createMovieSchema,
  updateMovieSchema,
  movieSearchSchema,
} from "~/schemas/video";

export const movieRouter = createTRPCRouter({
  // Get all movies for the current user
  getAll: protectedProcedure
    .input(movieSearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, categoryId, noCategory, sortBy, sortOrder, pagination } =
        input;
      const { page, pageSize } = pagination;
      const skip = (page - 1) * pageSize;

      const where = {
        userId: ctx.session.user.id,
        ...(query && {
          title: {
            contains: query,
            mode: "insensitive" as const,
          },
        }),
        ...(categoryId && { categoryId }),
        ...(noCategory && { categoryId: null }),
      };

      const [movies, total] = await Promise.all([
        ctx.db.movie.findMany({
          where,
          include: {
            category: true,
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
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        ctx.db.movie.count({ where }),
      ]);

      return {
        movies,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    }),

  // Get a single movie by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const movie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          category: true,
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

      if (!movie) {
        throw new Error("Movie not found");
      }

      return movie;
    }),

  // Create a new movie
  create: protectedProcedure
    .input(createMovieSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.movie.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
        include: {
          category: true,
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

  // Update a movie
  update: protectedProcedure
    .input(updateMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingMovie = await ctx.db.movie.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingMovie) {
        throw new Error("Movie not found");
      }

      return ctx.db.movie.update({
        where: { id },
        data: {
          ...updateData,
          ...(updateData.categoryId === "" && { categoryId: null }),
        },
        include: {
          category: true,
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

  // Delete a movie
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingMovie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingMovie) {
        throw new Error("Movie not found");
      }

      return ctx.db.movie.delete({
        where: { id: input.id },
      });
    }),

  // Toggle watched status
  toggleWatched: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        watchedAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingMovie = await ctx.db.movie.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingMovie) {
        throw new Error("Movie not found");
      }

      return ctx.db.movie.update({
        where: { id: input.id },
        data: {
          watchedAt: input.watchedAt,
        },
        include: {
          category: true,
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

  // Get movies by category
  getByCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        pagination: z
          .object({
            page: z.number().int().positive().optional().default(1),
            pageSize: z.number().int().positive().optional().default(12),
          })
          .optional()
          .default({ page: 1, pageSize: 12 }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { categoryId, pagination } = input;
      const { page, pageSize } = pagination;
      const skip = (page - 1) * pageSize;

      const where = {
        userId: ctx.session.user.id,
        categoryId,
      };

      const [movies, total] = await Promise.all([
        ctx.db.movie.findMany({
          where,
          include: {
            category: true,
            releases: {
              include: {
                items: true,
              },
            },
          },
          orderBy: { title: "asc" },
          skip,
          take: pageSize,
        }),
        ctx.db.movie.count({ where }),
      ]);

      return {
        movies,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    }),
});
