import { z } from "zod";

export interface TvShowSearchResult {
  name: string;
  originalName: string;
  firstAirYear: number;
  overview: string;
  posterPath?: string;
  posterUrl?: string;
  tmdbId: string;
  imdbId?: string;
}

export interface TvShowDetail {
  name: string;
  originalName: string;
  overview: string;
  firstAirDate: string;
  firstAirYear: number;
  posterPath?: string;
  posterUrl?: string;
  tmdbId: string;
  imdbId?: string;
  genres: string[];
  numberOfSeasons: number;
  numberOfEpisodes: number;
  originalLanguage: string;
  status: string;
}

export const TvShowDetailSchema = z.object({
  name: z.string(),
  originalName: z.string(),
  overview: z.string(),
  firstAirDate: z.string(),
  firstAirYear: z.number(),
  posterUrl: z.string().url().optional(),
  tmdbId: z.string(),
  imdbId: z.string().optional(),
  genres: z.array(z.string()),
  numberOfSeasons: z.number(),
  numberOfEpisodes: z.number(),
  originalLanguage: z.string(),
  status: z.string(),
});

export interface TvShowMetadataService {
  serviceId: string;
  serviceName: string;
  searchByTitle(title: string): Promise<TvShowSearchResult[]>;
  getTvShowDetail(tmdbId: string): Promise<TvShowDetail>;
}
