import { z } from "zod";

export const quoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional().nullable(),
  pageStart: z.coerce.number().int().min(1, "Page number must be at least 1"),
  pageEnd: z.coerce
    .number()
    .int()
    .min(1, "Page number must be at least 1")
    .optional()
    .nullable(),
  text: z.string().min(1, "Quote text is required"),
  bookId: z.string().min(1, "Book ID is required"),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
