import { z } from "zod";

export interface MovieSearchResult {
  title: string;
  originalTitle: string;
  releaseYear: number;
  overview: string;
  posterPath?: string;
  posterUrl?: string;
  tmdbId: string;
  imdbId?: string;
}

export interface MovieDetail {
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  releaseYear: number;
  posterPath?: string;
  posterUrl?: string;
  tmdbId: string;
  imdbId?: string;
  genres: string[];
  runtime?: number;
  originalLanguage: string;
}

export const MovieDetailSchema = z.object({
  title: z.string(),
  originalTitle: z.string(),
  overview: z.string(),
  releaseDate: z.string(),
  releaseYear: z.number(),
  posterUrl: z.string().url().optional(),
  tmdbId: z.string(),
  imdbId: z.string().optional(),
  genres: z.array(z.string()),
  runtime: z.number().optional(),
  originalLanguage: z.string(),
});

export interface MovieMetadataService {
  serviceId: string;
  serviceName: string;
  searchByTitle(title: string): Promise<MovieSearchResult[]>;
  getMovieDetail(tmdbId: string): Promise<MovieDetail>;
}
