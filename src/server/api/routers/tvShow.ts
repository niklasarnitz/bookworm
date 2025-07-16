import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  createTvShowSchema,
  updateTvShowSchema,
  tvShowSearchSchema,
} from "~/schemas/tvShow";

export const tvShowRouter = createTRPCRouter({
  // Get all TV shows for the current user
  getAll: protectedProcedure
    .input(tvShowSearchSchema)
    .query(async ({ ctx, input }) => {
      const {
        query,
        categoryId,
        noCategory,
        hasPhysicalItems,
        sortBy,
        sortOrder,
        pagination,
      } = input;
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
        ...(hasPhysicalItems !== undefined && {
          seasons: hasPhysicalItems
            ? {
                some: {
                  releases: {
                    some: {
                      items: {
                        some: {},
                      },
                    },
                  },
                },
              }
            : {
                none: {
                  releases: {
                    some: {
                      items: {
                        some: {},
                      },
                    },
                  },
                },
              },
        }),
      };

      const [tvShows, total] = await Promise.all([
        ctx.db.tvShow.findMany({
          where,
          include: {
            category: true,
            seasons: {
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
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: pageSize,
        }),
        ctx.db.tvShow.count({ where }),
      ]);

      return {
        tvShows,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    }),

  // Get a single TV show by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          category: true,
          seasons: {
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
          },
        },
      });

      if (!tvShow) {
        throw new Error("TV Show not found");
      }

      return tvShow;
    }),

  // Create a new TV show
  create: protectedProcedure
    .input(createTvShowSchema)
    .mutation(async ({ ctx, input }) => {
      // Remove undefined/empty categoryId to avoid foreign key constraint issues
      const { categoryId, ...restInput } = input;
      const data = {
        ...restInput,
        userId: ctx.session.user.id,
        ...(categoryId && categoryId.trim() !== "" ? { categoryId } : {}),
      };

      return ctx.db.tvShow.create({
        data,
        include: {
          category: true,
          seasons: {
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
          },
        },
      });
    }),

  // Update a TV show
  update: protectedProcedure
    .input(updateTvShowSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify ownership
      const existingTvShow = await ctx.db.tvShow.findFirst({
        where: {
          id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingTvShow) {
        throw new Error("TV Show not found");
      }

      // Remove undefined/empty categoryId to avoid foreign key constraint issues
      const { categoryId, ...restUpdateData } = updateData;
      const updatePayload = {
        ...restUpdateData,
        ...(categoryId && categoryId.trim() !== "" ? { categoryId } : {}),
      };

      return ctx.db.tvShow.update({
        where: { id },
        data: updatePayload,
        include: {
          category: true,
          seasons: {
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
          },
        },
      });
    }),

  // Delete a TV show
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingTvShow = await ctx.db.tvShow.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!existingTvShow) {
        throw new Error("TV Show not found");
      }

      return ctx.db.tvShow.delete({
        where: { id: input.id },
      });
    }),

  // Get TV shows by category
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

      const [tvShows, total] = await Promise.all([
        ctx.db.tvShow.findMany({
          where,
          include: {
            category: true,
            seasons: {
              include: {
                releases: {
                  include: {
                    items: true,
                  },
                },
              },
              orderBy: { seasonNumber: "asc" },
            },
          },
          orderBy: { title: "asc" },
          skip,
          take: pageSize,
        }),
        ctx.db.tvShow.count({ where }),
      ]);

      return {
        tvShows,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
      };
    }),
});
