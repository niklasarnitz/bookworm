import { z } from "zod";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";

const registerSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
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
        },
      });

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      };
    }),
});
