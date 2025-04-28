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
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      where: {
        // Add user filter to ensure users only see their own categories
        userId: ctx.session.user.id,
      },
      include: {
        _count: {
          select: {
            books: true,
          },
        },
      },
    });

    return sortCategoriesByPath(categories);
  }),

  getByParent: protectedProcedure
    .input(z.object({ parentId: z.string().nullable().optional() }))
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: {
          parentId: input.parentId ?? null,
          // Add user filter
          userId: ctx.session.user.id,
        },
      });

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
          // Add user filter
          userId: ctx.session.user.id,
        },
        take: 20,
      });

      return sortCategoriesByPath(categories);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Verify category belongs to current user
      if (category.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this category",
        });
      }

      return category;
    }),

  getByPath: protectedProcedure
    .input(getByPathSchema)
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: { path: input.path },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      // Verify category belongs to current user
      if (category.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this category",
        });
      }

      return category;
    }),

  getTree: protectedProcedure.query(async ({ ctx }) => {
    // First fetch all categories sorted by level for constructing the tree efficiently
    const allCategories = await ctx.db.category.findMany({
      // Add user filter to ensure users only see their own categories
      where: {
        userId: ctx.session.user.id,
      },
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

      // Verify category belongs to current user
      if (category.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to access this category",
        });
      }

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
        where: {
          id: { in: input.ids },
          // Add user filter
          userId: ctx.session.user.id,
        },
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

      // If parent is provided, verify it belongs to the current user
      if (parentId) {
        const parent = await ctx.db.category.findUnique({
          where: { id: parentId },
          select: { userId: true },
        });

        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent category not found",
          });
        }

        if (parent.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to use this parent category",
          });
        }
      }

      // Transaction to ensure we get proper paths and sort orders
      return ctx.db.$transaction(async (tx) => {
        // Find parent if provided
        const parent = parentId
          ? await tx.category.findUnique({ where: { id: parentId } })
          : null;

        const level = parent ? parent.level + 1 : 0;

        // Find the highest sort order at the given parent level
        const lastCategory = await tx.category.findFirst({
          where: {
            parentId: parentId ?? null,
            // Add user filter to find last category for this user
            userId: ctx.session.user.id,
          },
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
            userId: ctx.session.user.id, // Add user ID
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

      // Check if the category belongs to the current user
      const existingCategory = await ctx.db.category.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existingCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      if (existingCategory.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this category",
        });
      }

      // If parent is specified, verify it belongs to the current user
      if (parentId) {
        const parent = await ctx.db.category.findUnique({
          where: { id: parentId },
          select: { userId: true },
        });

        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent category not found",
          });
        }

        if (parent.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to use this parent category",
          });
        }
      }

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
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        // Check if the new parent is valid (not itself or one of its descendants)
        if (parentId === id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Category cannot be its own parent",
          });
        }

        if (parentId) {
          const newParent = await tx.category.findUnique({
            where: { id: parentId },
          });

          if (!newParent) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent category not found",
            });
          }

          // Make sure we're not making a category a child of its own descendant
          if (newParent.path.startsWith(category.path + ".")) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot move a category to one of its descendants",
            });
          }
        }

        // Find the highest sort order at the new parent level
        const lastCategory = await tx.category.findFirst({
          where: {
            parentId: parentId ?? null,
            userId: ctx.session.user.id,
          },
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
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Parent category not found",
            });
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

      // Check if the category belongs to the current user
      const category = await ctx.db.category.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      if (category.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this category",
        });
      }

      // First check if the category has any books assigned
      const booksWithCategory = await ctx.db.book.findMany({
        where: {
          categoryId: id,
          userId: ctx.session.user.id,
        },
        select: { id: true },
      });

      if (booksWithCategory.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete a category that has books assigned to it",
        });
      }

      return ctx.db.$transaction(async (tx) => {
        // Get the category and its children
        const categoryWithChildren = await tx.category.findUnique({
          where: { id },
          include: { children: true },
        });

        if (!categoryWithChildren) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Category not found",
          });
        }

        // If there are children categories, prevent deletion
        if (categoryWithChildren.children.length > 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete a category that has subcategories",
          });
        }

        return tx.category.delete({
          where: { id },
        });
      });
    }),
});
