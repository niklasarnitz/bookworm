import { z } from "zod";
import type { RouterOutputs } from "~/trpc/react";

export const authorCreateSchema = z.object({
  name: z.string().min(1, "Author name is required"),
});

export const authorSchema = authorCreateSchema.extend({
  id: z.string(),
});

// Add pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

export const authorSearchSchema = z.object({
  query: z.string().optional(),
  pagination: paginationSchema.optional(),
});

export type AuthorCreate = z.infer<typeof authorCreateSchema>;
export type AuthorSearch = z.infer<typeof authorSearchSchema>;

export type Author = RouterOutputs["author"]["getAll"]["authors"][number];
