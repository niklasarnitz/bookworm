import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createCategorySchema,
  categorySearchSchema,
  getByPathSchema,
  getCategoriesByMediaTypeSchema,
  updateCategorySchema,
} from "../../../schemas/category";
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
            movies: true,
            tvShows: true,
          },
        },
      },
    });

    return sortCategoriesByPath(categories);
  }),

  getByMediaType: protectedProcedure
    .input(getCategoriesByMediaTypeSchema)
    .query(async ({ ctx, input }) => {
      const categories = await ctx.db.category.findMany({
        where: {
          userId: ctx.session.user.id,
          mediaType: input.mediaType,
        },
        include: {
          _count: {
            select: {
              books: true,
              movies: true,
              tvShows: true,
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
      include: { _count: { select: { books: true } } },
    });

    // Sort by numeric path within each level
    const categoriesByLevel: Record<number, typeof allCategories> = {};
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
    const categoriesByParent: Record<string, typeof allCategories> = {
      root: [],
    };

    sortedCategories.forEach((category) => {
      const parentKey = category?.parentId ?? "root";
      categoriesByParent[parentKey] ??= [];
      if (category) {
        categoriesByParent[parentKey].push(category);
      }
    });

    // Define the type for a category with children
    type CategoryWithChildren = (typeof allCategories)[0] & {
      children: CategoryWithChildren[];
      totalBookCount?: number;
    };

    // Then build the tree recursively
    function buildTree(parentId: string | null): CategoryWithChildren[] {
      const key = parentId ?? "root";
      if (!categoriesByParent[key]) return [];

      const categories = categoriesByParent[key];

      return categories.map((category) => ({
        ...category,
        children: buildTree(category.id),
      }));
    }

    // Build the initial tree
    const tree = buildTree(null);

    // Function to calculate total book count for each category including its children
    function calculateTotalBookCount(
      categories: CategoryWithChildren[],
    ): CategoryWithChildren[] {
      return categories.map((category) => {
        // Calculate total book count for children first
        const children = calculateTotalBookCount(category.children);

        // Sum up all book counts from children
        const childrenBookCount = children.reduce(
          (sum, child) => sum + (child.totalBookCount ?? 0),
          0,
        );

        // Total is direct book count plus children's book count
        const totalBookCount =
          (category._count?.books ?? 0) + childrenBookCount;

        return {
          ...category,
          children,
          totalBookCount,
        };
      });
    }

    // Calculate total book counts for the tree
    const treeWithTotalCounts = calculateTotalBookCount(tree);

    return treeWithTotalCounts;
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
      const { name, parentId, mediaType } = input;

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
            userId: ctx.session.user.id, // Add user ID,
            mediaType,
          },
        });
      });
    }),

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, name, parentId, mediaType } = input;

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
          data: { name, mediaType },
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
            mediaType,
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
