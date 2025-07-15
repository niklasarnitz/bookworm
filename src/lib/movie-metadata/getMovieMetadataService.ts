import { services } from "~/lib/movie-metadata/services";
import type { MovieMetadataService } from "~/lib/movie-metadata/types";

export function getMovieMetadataService(
  serviceId: string,
): MovieMetadataService {
  const service = services[serviceId as keyof typeof services];
  if (!service) {
    throw new Error(`Movie metadata service '${serviceId}' not found`);
  }
  return service;
}
