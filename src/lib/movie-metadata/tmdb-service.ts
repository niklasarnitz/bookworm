import type {
  MovieMetadataService,
  MovieSearchResult,
  MovieDetail,
} from "./types";
import { env } from "~/env.js";

const TMDB_API_KEY = env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface TMDBMovieSearchResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  backdrop_path?: string;
  video: boolean;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path?: string;
  genres: { id: number; name: string }[];
  runtime?: number;
  original_language: string;
  imdb_id?: string;
  status: string;
  tagline?: string;
  budget: number;
  revenue: number;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

export class TMDBMovieService implements MovieMetadataService {
  serviceId = "tmdb";
  serviceName = "The Movie Database";

  private async makeRequest<T>(endpoint: string): Promise<T> {
    if (!TMDB_API_KEY) {
      throw new Error("TMDB API key is not configured");
    }

    const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json() as T;
  }

  async searchByTitle(title: string): Promise<MovieSearchResult[]> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const endpoint = `/search/movie?query=${encodedTitle}&include_adult=false&language=en-US&page=1`;

      const response =
        await this.makeRequest<TMDBMovieSearchResponse>(endpoint);

      return response.results.map((movie) => ({
        title: movie.title,
        originalTitle: movie.original_title,
        releaseYear: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : 0,
        overview: movie.overview,
        posterPath: movie.poster_path,
        posterUrl: movie.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : undefined,
        tmdbId: movie.id.toString(),
      }));
    } catch (error) {
      console.error("Error searching movies with TMDB:", error);
      throw error;
    }
  }

  async getMovieDetail(tmdbId: string): Promise<MovieDetail> {
    try {
      const endpoint = `/movie/${tmdbId}?language=en-US`;
      const movie = await this.makeRequest<TMDBMovieDetails>(endpoint);

      return {
        title: movie.title,
        originalTitle: movie.original_title,
        overview: movie.overview,
        releaseDate: movie.release_date,
        releaseYear: movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : 0,
        posterPath: movie.poster_path,
        posterUrl: movie.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
          : undefined,
        tmdbId: movie.id.toString(),
        imdbId: movie.imdb_id,
        genres: movie.genres.map((genre) => genre.name),
        runtime: movie.runtime,
        originalLanguage: movie.original_language,
      };
    } catch (error) {
      console.error("Error fetching movie details from TMDB:", error);
      throw error;
    }
  }
}
