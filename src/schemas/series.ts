import { z } from "zod";
import type { RouterOutputs } from "~/trpc/react";

export const seriesCreateSchema = z.object({
  name: z.string().min(1, "Series name is required"),
});

export const seriesSchema = seriesCreateSchema.extend({
  id: z.string(),
});

export const seriesSearchSchema = z.object({
  query: z.string().optional(),
  pagination: z
    .object({
      page: z.number().int().positive().optional().default(1),
      pageSize: z.number().int().positive().optional().default(20),
    })
    .optional(),
});

export type SeriesCreate = z.infer<typeof seriesCreateSchema>;
export type Series = RouterOutputs["series"]["getAll"]["series"][number];
export type SeriesSearch = z.infer<typeof seriesSearchSchema>;
