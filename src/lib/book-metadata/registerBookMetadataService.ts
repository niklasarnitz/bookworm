import { services } from "~/lib/book-metadata/services";
import type { BookMetadataService } from "~/lib/book-metadata/types";

/**
 * Register a new book metadata service
 * @param service - The service to register
 */

export function registerBookMetadataService(
  service: BookMetadataService,
): void {
  services[service.serviceId] = service;
}
