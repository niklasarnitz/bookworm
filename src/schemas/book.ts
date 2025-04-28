import { z } from "zod";

// Schema for creating a book author relationship with optional tags
export const bookAuthorCreateSchema = z.object({
  authorId: z.string().min(1, "Author ID is required").optional(),
  authorName: z.string().optional(),
  tag: z.string().optional().nullable(),
});

// Schema for book author relationship with ID
export const bookAuthorSchema = bookAuthorCreateSchema.extend({
  id: z.string(),
});

export const bookCreateSchema = z.object({
  name: z.string().min(1, "Book name is required"),
  subtitle: z.string().optional().nullable(),
  isbn: z.string().optional().nullable(),
  // Use array of book authors
  bookAuthors: z
    .array(bookAuthorCreateSchema)
    .min(1, "At least one author is required"),
  seriesId: z.string().optional().nullable(),
  // For new series creation
  newSeriesName: z.string().optional(),
  seriesNumber: z.number().optional().nullable(),
  coverUrl: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  pages: z.number().optional().nullable(),
});

export const bookSchema = bookCreateSchema.extend({
  id: z.string(),
});

export const bookSearchSchema = z.object({
  query: z.string().optional(),
  authorId: z.string().optional(),
  seriesId: z.string().optional(),
  categoryId: z.string().optional(),
  noCover: z.boolean().optional(),
  noCategory: z.boolean().optional(),
});

export type BookAuthorCreate = z.infer<typeof bookAuthorCreateSchema>;
export type BookAuthor = z.infer<typeof bookAuthorSchema>;
export type BookCreate = z.infer<typeof bookCreateSchema>;
export type Book = z.infer<typeof bookSchema>;
export type BookSearch = z.infer<typeof bookSearchSchema>;

export const viewModeSchema = z.enum(["grid", "table"]);
export type ViewMode = z.infer<typeof viewModeSchema>;
