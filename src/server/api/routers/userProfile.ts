import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hash, compare } from "bcryptjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

export const userProfileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const user = await ctx.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        _count: {
          select: {
            books: true,
            authors: true,
            series: true,
            categories: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return user;
  }),

  getPublicProfile: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          createdAt: true,
          role: true,
          _count: {
            select: {
              books: true,
              authors: true,
              series: true,
              categories: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.username) {
        const existingUsername = await ctx.db.user.findFirst({
          where: {
            username: input.username,
            id: { not: userId },
          },
        });

        if (existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already exists",
          });
        }
      }

      if (input.email) {
        const existingEmail = await ctx.db.user.findFirst({
          where: {
            email: input.email,
            id: { not: userId },
          },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: {
          name: input.name,
          email: input.email,
          username: input.username,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
        },
      });

      return updatedUser;
    }),

  changePassword: protectedProcedure
    .input(passwordChangeSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          password: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const isPasswordValid = await compare(
        input.currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      const hashedPassword = await hash(input.newPassword, 12);

      await ctx.db.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      return { success: true };
    }),

  getStats: protectedProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { username: input.username },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const counts = await ctx.db.user.findUnique({
        where: { id: user.id },
        select: {
          _count: {
            select: {
              books: true,
              authors: true,
              series: true,
              categories: true,
            },
          },
        },
      });

      const recentBooks = await ctx.db.book.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          category: {
            include: {
              _count: {
                select: {
                  books: true,
                },
              },
            },
          },
          series: true,
        },
      });

      const topAuthors = await ctx.db.author.findMany({
        where: { userId: user.id },
        orderBy: {
          books: {
            _count: "desc",
          },
        },
        take: 5,
        include: {
          _count: {
            select: {
              books: true,
            },
          },
        },
      });

      return {
        counts: counts?._count,
        recentBooks,
        topAuthors,
      };
    }),
});
