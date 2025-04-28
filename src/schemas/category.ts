import { z } from "zod";

// Schema for categories
export const categorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Category name is required"),
  path: z.string(),
  parentId: z.string().cuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().cuid().optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().cuid().nullable(),
});

export const deleteCategorySchema = z.object({
  id: z.string().cuid(),
});

export const getCategoryPathSchema = z.object({
  id: z.string().cuid(),
});

export const getByPathSchema = z.object({
  path: z.string().min(1, "Path is required"),
});

// Add missing search schema
export const categorySearchSchema = z.object({
  query: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
