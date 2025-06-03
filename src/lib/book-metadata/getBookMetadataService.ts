import { services } from "./services";
import type { BookMetadataService } from "~/lib/book-metadata/types";

/**
 * Get a specific book metadata service by ID
 * @param serviceId - The ID of the service to get
 * @returns The service instance
 */

export function getBookMetadataService(serviceId: string): BookMetadataService {
  const service = services[serviceId];
  if (!service) {
    throw new Error(`Book metadata service '${serviceId}' not found`);
  }
  return service;
}
