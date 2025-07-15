import { TMDBMovieService } from "~/lib/movie-metadata/tmdb-service";
import type { MovieMetadataService } from "~/lib/movie-metadata/types";

// Registry of available movie metadata services

export const services: Record<"tmdb", MovieMetadataService> = {
  tmdb: new TMDBMovieService(),
} as const;
