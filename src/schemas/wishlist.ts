import { z } from "zod";
import type { RouterOutputs } from "~/trpc/react";
import { bookAuthorCreateSchema, bookAuthorSchema } from "./book";

// Reuse the book author schemas since they're identical
export const wishlistItemAuthorCreateSchema = bookAuthorCreateSchema;
export const wishlistItemAuthorSchema = bookAuthorSchema;

export const wishlistItemCreateSchema = z.object({
  name: z.string().min(1, "Book name is required"),
  subtitle: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  bookAuthors: z
    .array(wishlistItemAuthorCreateSchema)
    .min(1, "At least one author is required"),
  seriesId: z.string().optional().nullable(),
  newSeriesName: z.string().optional(),
  seriesNumber: z.number().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  publisher: z.string().optional().nullable(),
  pages: z.number().optional().nullable(),
});

export const wishlistItemSchema = wishlistItemCreateSchema.extend({
  id: z.string(),
});

export const wishlistSearchSchema = z.object({
  query: z.string().optional(),
  authorId: z.string().optional(),
  seriesId: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "author", "series"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  pagination: z.object({
    page: z.number().int().positive().optional().default(1),
    pageSize: z.number().int().positive().optional().default(12),
  }),
});

export type WishlistItemAuthorCreate = z.infer<
  typeof wishlistItemAuthorCreateSchema
>;
export type WishlistItemAuthor = z.infer<typeof wishlistItemAuthorSchema>;
export type WishlistItemCreate = z.infer<typeof wishlistItemCreateSchema>;
export type WishlistSearch = z.infer<typeof wishlistSearchSchema>;
export type WishlistItem =
  RouterOutputs["wishlist"]["getAll"]["wishlistItems"][number];
