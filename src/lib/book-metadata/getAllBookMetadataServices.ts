import { services } from "./services";
import type { BookMetadataService } from "~/lib/book-metadata/types";

/**
 * Get all available book metadata services
 * @returns Array of all registered services
 */

export function getAllBookMetadataServices(): BookMetadataService[] {
  return Object.values(services);
}
