import { AmazonBookService } from "~/lib/book-metadata/amazon-service";
import type { BookMetadataService } from "~/lib/book-metadata/types";

// Registry of available book metadata services

export const services: Record<"amazon", BookMetadataService> = {
  amazon: new AmazonBookService(),
} as const;
