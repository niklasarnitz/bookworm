import { z } from "zod";

export interface BookSearchResult {
  title: string;
  author: string;
  detailUrl: string;
}

export interface BookDetail {
  title: string;
  subtitle?: string;
  authors: string[];
  coverImageUrl?: string;
  publisher?: string;
  isbn?: string;
}

export const BookDetailSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  authors: z.array(z.string()),
  coverImageUrl: z.string().url().optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
});

export interface BookMetadataService {
  serviceId: string;
  serviceName: string;
  searchByIdentifier(identifier: string): Promise<BookSearchResult[]>;
  getBookDetail(detailUrl: string): Promise<BookDetail>;
}
