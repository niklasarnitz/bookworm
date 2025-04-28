import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN"]),
});

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]),
});

export const userUpdateSchema = userCreateSchema.extend({
  id: z.string(),
});

export const userSearchSchema = z.object({
  query: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
