import { z } from "zod";
import { paginationSchema, sortOrderSchema } from "./media";

// Video format enum matching Prisma enum
export const videoFormatSchema = z.enum([
  "DVD",
  "BLURAY",
  "BLURAY_4K",
  "BLURAY_3D",
  "LASERDISC",
  "VHS",
  "VCD",
]);
export type VideoFormat = z.infer<typeof videoFormatSchema>;

// Audio track schema
export const audioTrackSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, "Language is required"),
  codec: z.string().min(1, "Codec is required"),
  channels: z.string().min(1, "Channels is required"),
});

// Subtitle schema
export const subtitleSchema = z.object({
  id: z.string().optional(),
  language: z.string().min(1, "Language is required"),
});

// Physical item schema (for discs, tapes, etc.)
export const physicalItemSchema = z.object({
  id: z.string().optional(),
  format: videoFormatSchema,
  discName: z.string().optional(),
  discNumber: z.number().int().positive().optional(),
  aspectRatio: z.string().optional(),
  durationMinutes: z.number().int().positive().optional(),
  audioTracks: z.array(audioTrackSchema).optional(),
  subtitles: z.array(subtitleSchema).optional(),
});

// Media release schema (specific video release/edition)
export const mediaReleaseSchema = z.object({
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

// Movie schema
export const movieSchema = z.object({
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
  watchedAt: z.date().optional(),
  categoryId: z.string().optional(),
  releases: z.array(mediaReleaseSchema).optional(),
});

// Movie search and filtering
export const movieSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  noCategory: z.boolean().optional(),
  sortBy: z
    .enum(["title", "originalReleaseYear", "createdAt", "watchedAt"])
    .optional()
    .default("title"),
  sortOrder: sortOrderSchema.optional().default("asc"),
  pagination: paginationSchema,
});

// Movie sort options for frontend
export const movieSortOptionsSchema = z.enum([
  "title",
  "originalReleaseYear",
  "createdAt",
  "watchedAt",
]);

// Form schemas for creating/editing (excluding nested relations)
export const createMovieSchema = movieSchema.omit({ id: true, releases: true });
export const updateMovieSchema = movieSchema
  .partial()
  .omit({ releases: true })
  .required({ id: true });

export const createMediaReleaseSchema = mediaReleaseSchema
  .omit({ id: true, items: true })
  .extend({
    movieId: z.string().min(1, "Movie ID is required"),
  });
export const updateMediaReleaseSchema = mediaReleaseSchema
  .partial()
  .omit({ items: true })
  .required({ id: true });

export const createPhysicalItemSchema = physicalItemSchema
  .omit({ id: true, audioTracks: true, subtitles: true })
  .extend({
    mediaReleaseId: z.string().min(1, "Media release ID is required"),
  });
export const updatePhysicalItemSchema = physicalItemSchema
  .partial()
  .omit({ audioTracks: true, subtitles: true })
  .required({ id: true });

// Audio track and subtitle management schemas
export const createAudioTrackSchema = audioTrackSchema
  .omit({ id: true })
  .extend({
    physicalItemId: z.string().min(1, "Physical item ID is required"),
  });
export const updateAudioTrackSchema = audioTrackSchema
  .partial()
  .required({ id: true });

export const createSubtitleSchema = subtitleSchema.omit({ id: true }).extend({
  physicalItemId: z.string().min(1, "Physical item ID is required"),
});
export const updateSubtitleSchema = subtitleSchema
  .partial()
  .required({ id: true });

// Export types
export type Movie = z.infer<typeof movieSchema>;
export type MediaRelease = z.infer<typeof mediaReleaseSchema>;
export type PhysicalItem = z.infer<typeof physicalItemSchema>;
export type AudioTrack = z.infer<typeof audioTrackSchema>;
export type Subtitle = z.infer<typeof subtitleSchema>;
export type MovieSearch = z.infer<typeof movieSearchSchema>;
export type MovieSortOptions = z.infer<typeof movieSortOptionsSchema>;
