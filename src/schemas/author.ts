import { z } from "zod";

export const authorCreateSchema = z.object({
  name: z.string().min(1, "Author name is required"),
});

export const authorSchema = authorCreateSchema.extend({
  id: z.string(),
});

export const authorSearchSchema = z.object({
  query: z.string().optional(),
});

export type AuthorCreate = z.infer<typeof authorCreateSchema>;
export type Author = z.infer<typeof authorSchema>;
export type AuthorSearch = z.infer<typeof authorSearchSchema>;
