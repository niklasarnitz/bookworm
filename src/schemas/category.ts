import { z } from "zod";
import type { RouterOutputs } from "~/trpc/react";
import { mediaTypeSchema } from "./media";

// Schema for categories
export const categorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Category name is required"),
  path: z.string(),
  parentId: z.string().cuid().nullable().optional(),
  mediaType: mediaTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().cuid().optional(),
  mediaType: mediaTypeSchema,
});

export const updateCategorySchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Category name is required"),
  parentId: z.string().cuid().nullable(),
  mediaType: mediaTypeSchema,
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
  mediaType: mediaTypeSchema.optional(),
});

// Schema for getting categories by media type
export const getCategoriesByMediaTypeSchema = z.object({
  mediaType: mediaTypeSchema,
});

export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type Category = RouterOutputs["category"]["getTree"][number];
