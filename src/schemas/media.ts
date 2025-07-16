import { z } from "zod";

// Media types enum
export const mediaTypeSchema = z.enum(["BOOK", "MOVIE", "TV_SHOW"]);
export type MediaType = z.infer<typeof mediaTypeSchema>;

// Common pagination schema (shared between books and videos)
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().optional().default(12),
});

export const sortOrderSchema = z.enum(["asc", "desc"]);

// View mode for media grid/table display (shared between books and videos)
export const viewModeSchema = z.enum(["grid", "table"]);
export type ViewMode = z.infer<typeof viewModeSchema>;

// Common types
export type Pagination = z.infer<typeof paginationSchema>;
export type SortOrder = z.infer<typeof sortOrderSchema>;
