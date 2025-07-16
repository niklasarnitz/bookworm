import { z } from "zod";
import { paginationSchema, sortOrderSchema } from "./media";
import { physicalItemSchema } from "./video";

// TV Season Release schema (specific season release/edition)
export const tvSeasonReleaseSchema = z.object({
  id: z.string().optional(),
  editionName: z.string().optional(),
  releaseDate: z.date().optional(),
  countryOfRelease: z.string().optional(),
  upc: z.string().min(1).optional().or(z.literal("")),
  publisherNumber: z.string().optional(),
  asin: z.string().min(1).optional().or(z.literal("")),
  distributor: z.string().optional(),
  publisher: z.string().optional(),
  items: z.array(physicalItemSchema).optional(),
});

// TV Season schema
export const tvSeasonSchema = z.object({
  id: z.string().optional(),
  seasonNumber: z.number().int().positive(),
  title: z.string().optional(),
  releaseYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .optional(),
  episodeCount: z.number().int().positive().optional(),
  plot: z.string().optional(),
  posterUrl: z.string().url().optional().or(z.literal("")),
  watchedAt: z.date().optional(),
  releases: z.array(tvSeasonReleaseSchema).optional(),
});

// TV Show schema
export const tvShowSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  originalReleaseYear: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 5),
  plot: z.string().optional(),
  posterUrl: z.string().url().optional().or(z.literal("")),
  tmdbId: z.string().optional(),
  imdbId: z.string().optional(),
  categoryId: z.string().optional(),
  seasons: z.array(tvSeasonSchema).optional(),
});

// TV Show search and filtering
export const tvShowSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  noCategory: z.boolean().optional(),
  hasPhysicalItems: z.boolean().optional(),
  sortBy: z
    .enum(["title", "originalReleaseYear", "createdAt"])
    .optional()
    .default("title"),
  sortOrder: sortOrderSchema.optional().default("asc"),
  pagination: paginationSchema,
});

// TV Show sort options for frontend
export const tvShowSortOptionsSchema = z.enum([
  "title",
  "originalReleaseYear",
  "createdAt",
]);

// Form schemas for creating/editing (excluding nested relations)
export const createTvShowSchema = tvShowSchema.omit({
  id: true,
  seasons: true,
});
export const updateTvShowSchema = tvShowSchema
  .partial()
  .omit({ seasons: true })
  .required({ id: true });

export const createTvSeasonSchema = tvSeasonSchema
  .omit({ id: true, releases: true })
  .extend({
    tvShowId: z.string().min(1, "TV Show ID is required"),
  });
export const updateTvSeasonSchema = tvSeasonSchema
  .partial()
  .omit({ releases: true })
  .required({ id: true });

export const createTvSeasonReleaseSchema = tvSeasonReleaseSchema
  .omit({ id: true, items: true })
  .extend({
    tvSeasonId: z.string().min(1, "TV Season ID is required"),
  });
export const updateTvSeasonReleaseSchema = tvSeasonReleaseSchema
  .partial()
  .omit({ items: true })
  .required({ id: true });

// Physical item schema for TV seasons - similar to movies but with tvSeasonReleaseId
export const createTvPhysicalItemSchema = physicalItemSchema
  .omit({ id: true, audioTracks: true, subtitles: true })
  .extend({
    tvSeasonReleaseId: z.string().min(1, "TV Season release ID is required"),
  });
export const updateTvPhysicalItemSchema = physicalItemSchema
  .partial()
  .omit({ audioTracks: true, subtitles: true })
  .required({ id: true });

// Export types
export type TvShow = z.infer<typeof tvShowSchema>;
export type TvSeason = z.infer<typeof tvSeasonSchema>;
export type TvSeasonRelease = z.infer<typeof tvSeasonReleaseSchema>;
export type TvShowSearch = z.infer<typeof tvShowSearchSchema>;
export type TvShowSortOptions = z.infer<typeof tvShowSortOptionsSchema>;
