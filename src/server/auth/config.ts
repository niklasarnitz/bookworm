import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "USER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    username?: string | null;
    image?: string | null;
    role?: "USER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN"; // Add role to the JWT
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const valid = z
          .object({
            username: z.string().min(1),
            password: z.string().min(1),
          })
          .safeParse(credentials);

        if (!valid.success) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { username: valid.data.username },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
            role: true,
          },
        });

        if (!user) {
          return null;
        }

        // Check if the password is correct
        const passwordMatch = await bcrypt.compare(
          valid.data.password,
          user.password,
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
    signOut: "/signin",
    newUser: "/signin",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - this is fine
        token.id = user.id;
        // @ts-expect-error - this is fine
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }: { session: DefaultSession; token: JWT }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
  },
  trustHost: true,
};
