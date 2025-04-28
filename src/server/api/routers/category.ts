import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createCategorySchema,
  categorySearchSchema,
  getByPathSchema,
} from "../../../schemas/category";
import type { Category } from "@prisma/client";
import { ObjectHelper, type URecord } from "@ainias42/js-helper";
import { sortCategoriesByPath } from "~/lib/category-utils";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    // Sort categories by their numeric path
    return sortCategoriesByPath(categories);
  }),

  getByParent: protectedProcedure
    .input(z.object({ parentId: z.string().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: {
          parentId: input.parentId ?? null,
        },
      });

      // Sort categories by their numeric path
      return sortCategoriesByPath(categories);
    }),

  search: protectedProcedure
    .input(categorySearchSchema)
    .query(async ({ ctx, input }) => {
      const { query, parentId } = input;

      const categories = await ctx.db.category.findMany({
        where: {
          name: query ? { contains: query, mode: "insensitive" } : undefined,
          parentId: parentId !== undefined ? parentId : undefined,
        },
        take: 20,
      });

      // Sort categories by their numeric path
      return sortCategoriesByPath(categories);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findUnique({
        where: { id: input.id },
      });
    }),

  getByPath: protectedProcedure
    .input(getByPathSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.category.findUnique({
        where: { path: input.path },
      });
    }),

  getTree: protectedProcedure.query(async ({ ctx }) => {
    // First fetch all categories sorted by level for constructing the tree efficiently
    const allCategories = await ctx.db.category.findMany({
      orderBy: { level: "asc" },
    });

    // Sort by numeric path within each level
    const categoriesByLevel: Record<number, Category[]> = {};
    allCategories.forEach((category) => {
      categoriesByLevel[category.level] ??= [];

      categoriesByLevel[category.level]?.push(category);
    });

    // Sort each level by path
    ObjectHelper.keys(categoriesByLevel).forEach((level) => {
      categoriesByLevel[level] = sortCategoriesByPath(
        categoriesByLevel[level] ?? [],
      );
    });

    // Flatten back to array, still ordered by level first
    const sortedCategories = Object.keys(categoriesByLevel)
      .map(Number)
      .sort((a, b) => a - b)
      .flatMap((level) => categoriesByLevel[level]);

    // First organize by parent
    const categoriesByParent: Record<string, Category[]> = { root: [] };

    sortedCategories.forEach((category) => {
      const parentKey = category?.parentId ?? "root";
      categoriesByParent[parentKey] ??= [];
      if (category) {
        categoriesByParent[parentKey].push(category);
      }
    });

    // Then build the tree recursively
    function buildTree(parentId: string | null): Category[] {
      const key = parentId ?? "root";
      if (!categoriesByParent[key]) return [];

      return categoriesByParent[key].map((category) => ({
        ...category,
        children: buildTree(category.id),
      })) as (Category & {
        children: Category[];
      })[];
    }

    return buildTree(null) as (Category & {
      children?: Category[];
    })[];
  }),

  getPath: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) return [];

      const pathParts = category.path.split(".");
      const result = [];
      let currentPath = "";

      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        const pathCategory = await ctx.db.category.findUnique({
          where: { path: currentPath },
        });
        if (pathCategory) {
          result.push(pathCategory);
        }
      }

      return result;
    }),

  getMultiplePaths: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: { id: { in: input.ids } },
      });

      return categories.reduce(
        (acc, category) => {
          acc[category.id] = category;
          return acc;
        },
        {} as URecord<string, (typeof categories)[number]>,
      );
    }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { name, parentId } = input;

      // Transaction to ensure we get proper paths and sort orders
      return ctx.db.$transaction(async (tx) => {
        // Find parent if provided
        const parent = parentId
          ? await tx.category.findUnique({ where: { id: parentId } })
          : null;

        const level = parent ? parent.level + 1 : 0;

        // Find the highest sort order at the given parent level
        const lastCategory = await tx.category.findFirst({
          where: { parentId: parentId ?? null },
          orderBy: { sortOrder: "desc" },
        });

        const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;

        // For root categories, we use only the sort order as path
        let path = sortOrder.toString();

        // For nested categories, prepend the parent's path
        if (parent) {
          path = `${parent.path}.${sortOrder}`;
        }

        // Create the category
        return tx.category.create({
          data: {
            name,
            path,
            level,
            sortOrder,
            parentId,
          },
        });
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        parentId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, parentId } = input;

      // Only update name if parentId is not changing
      if (parentId === undefined) {
        return ctx.db.category.update({
          where: { id },
          data: { name },
        });
      }

      // For parent changes, we need a transaction to update paths
      return ctx.db.$transaction(async (tx) => {
        const category = await tx.category.findUnique({
          where: { id },
          include: { children: true },
        });

        if (!category) {
          throw new Error("Category not found");
        }

        // Check if the new parent is valid (not itself or one of its descendants)
        if (parentId === id) {
          throw new Error("Category cannot be its own parent");
        }

        if (parentId) {
          const newParent = await tx.category.findUnique({
            where: { id: parentId },
          });

          if (!newParent) {
            throw new Error("Parent category not found");
          }

          // Make sure we're not making a category a child of its own descendant
          if (newParent.path.startsWith(category.path + ".")) {
            throw new Error("Cannot move a category to one of its descendants");
          }
        }

        // Find the highest sort order at the new parent level
        const lastCategory = await tx.category.findFirst({
          where: { parentId: parentId ?? null },
          orderBy: { sortOrder: "desc" },
        });

        const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
        const level = parentId
          ? await tx.category
              .findUnique({ where: { id: parentId } })
              .then((parent) => (parent ? parent.level + 1 : 0))
          : 0;

        // For root categories, we use only the sort order as path
        let path = sortOrder.toString();

        // For nested categories, prepend the parent's path
        if (parentId) {
          const newParent = await tx.category.findUnique({
            where: { id: parentId },
          });

          if (!newParent) {
            throw new Error("Parent category not found");
          }

          path = `${newParent.path}.${sortOrder}`;
        }

        // Update just this category for now (children will be handled separately if needed)
        return tx.category.update({
          where: { id },
          data: {
            name,
            parentId,
            path,
            level,
            sortOrder,
          },
        });

        // Note: Updating descendant paths would be more complex and require
        // additional logic, but isn't implemented here to keep the identifiers stable
        // as per requirements
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // First check if the category has any books assigned
      const booksWithCategory = await ctx.db.book.findMany({
        where: { categoryId: id },
        select: { id: true },
      });

      if (booksWithCategory.length > 0) {
        throw new Error(
          "Cannot delete a category that has books assigned to it",
        );
      }

      return ctx.db.$transaction(async (tx) => {
        // Get the category and its children
        const category = await tx.category.findUnique({
          where: { id },
          include: { children: true },
        });

        if (!category) {
          throw new Error("Category not found");
        }

        // If there are children categories, prevent deletion
        if (category.children.length > 0) {
          throw new Error("Cannot delete a category that has subcategories");
        }

        return tx.category.delete({
          where: { id },
        });
      });
    }),
});
