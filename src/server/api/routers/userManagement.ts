import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { hash } from "bcryptjs";
import { createTRPCRouter, adminProcedure, protectedProcedure } from "../trpc";
import { UserRole } from "@prisma/client";

const userCreateSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).default(UserRole.USER),
});

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).optional(),
});

export const userManagementRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            authors: true,
            series: true,
            categories: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  }),
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
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

  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if username already exists
      const existingUsername = await ctx.db.user.findUnique({
        where: { username: input.username },
      });

      if (existingUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      // Check if email already exists
      const existingEmail = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const hashedPassword = await hash(input.password, 12);

      const user = await ctx.db.user.create({
        data: {
          username: input.username,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return user;
    }),

  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check if user exists
      const userExists = await ctx.db.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!userExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // If username is being updated, check if it already exists
      if (data.username) {
        const existingUsername = await ctx.db.user.findFirst({
          where: {
            username: data.username,
            id: { not: id },
          },
        });

        if (existingUsername) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already exists",
          });
        }
      }

      // If email is being updated, check if it already exists
      if (data.email) {
        const existingEmail = await ctx.db.user.findFirst({
          where: {
            email: data.email,
            id: { not: id },
          },
        });

        if (existingEmail) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }
      }

      // Hash password if it's being updated
      const updateData = { ...data };
      if (data.password) {
        updateData.password = await hash(data.password, 12);
      }

      const updatedUser = await ctx.db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return updatedUser;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Check if user exists
      const userExists = await ctx.db.user.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!userExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent deleting the current user
      if (id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete your own account",
        });
      }

      return ctx.db.user.delete({
        where: { id },
      });
    }),
});
