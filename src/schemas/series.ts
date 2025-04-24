import { z } from "zod";

export const seriesCreateSchema = z.object({
  name: z.string().min(1, "Series name is required"),
});

export const seriesSchema = seriesCreateSchema.extend({
  id: z.string(),
});

export const seriesSearchSchema = z.object({
  query: z.string().optional(),
});

export type SeriesCreate = z.infer<typeof seriesCreateSchema>;
export type Series = z.infer<typeof seriesSchema>;
export type SeriesSearch = z.infer<typeof seriesSearchSchema>;
