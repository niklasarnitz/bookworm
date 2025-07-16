import { TMDBTvShowService } from "./tmdb-service";
import type { TvShowMetadataService } from "./types";

export const tvShowMetadataServices: TvShowMetadataService[] = [
  new TMDBTvShowService(),
];

export const defaultTvShowMetadataService = tvShowMetadataServices[0];
