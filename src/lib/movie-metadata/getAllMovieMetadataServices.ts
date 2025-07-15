import { services } from "~/lib/movie-metadata/services";
import type { MovieMetadataService } from "~/lib/movie-metadata/types";

export function getAllMovieMetadataServices(): MovieMetadataService[] {
  return Object.values(services);
}
