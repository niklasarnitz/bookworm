import type {
  TvShowMetadataService,
  TvShowSearchResult,
  TvShowDetail,
} from "./types";
import { env } from "~/env.js";

const TMDB_API_KEY = env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

interface TMDBTvShowSearchResponse {
  page: number;
  results: TMDBTvShow[];
  total_pages: number;
  total_results: number;
}

interface TMDBTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path?: string;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  backdrop_path?: string;
  origin_country: string[];
}

interface TMDBTvShowDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path?: string;
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  original_language: string;
  status: string;
  tagline?: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  external_ids?: {
    imdb_id?: string;
    freebase_mid?: string;
    freebase_id?: string;
    tvdb_id?: number;
  };
}

export class TMDBTvShowService implements TvShowMetadataService {
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

  async searchByTitle(title: string): Promise<TvShowSearchResult[]> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const endpoint = `/search/tv?query=${encodedTitle}&include_adult=false&language=en-US&page=1`;

      const response =
        await this.makeRequest<TMDBTvShowSearchResponse>(endpoint);

      return response.results.map((tvShow) => ({
        name: tvShow.name,
        originalName: tvShow.original_name,
        firstAirYear: tvShow.first_air_date
          ? new Date(tvShow.first_air_date).getFullYear()
          : 0,
        overview: tvShow.overview,
        posterPath: tvShow.poster_path,
        posterUrl: tvShow.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`
          : undefined,
        tmdbId: tvShow.id.toString(),
      }));
    } catch (error) {
      console.error("Error searching TV shows with TMDB:", error);
      throw error;
    }
  }

  async getTvShowDetail(tmdbId: string): Promise<TvShowDetail> {
    try {
      const [tvShowResponse, externalIdsResponse] = await Promise.all([
        this.makeRequest<TMDBTvShowDetails>(`/tv/${tmdbId}?language=en-US`),
        this.makeRequest<{ imdb_id?: string }>(`/tv/${tmdbId}/external_ids`),
      ]);

      return {
        name: tvShowResponse.name,
        originalName: tvShowResponse.original_name,
        overview: tvShowResponse.overview,
        firstAirDate: tvShowResponse.first_air_date,
        firstAirYear: tvShowResponse.first_air_date
          ? new Date(tvShowResponse.first_air_date).getFullYear()
          : 0,
        posterPath: tvShowResponse.poster_path,
        posterUrl: tvShowResponse.poster_path
          ? `${TMDB_IMAGE_BASE_URL}${tvShowResponse.poster_path}`
          : undefined,
        tmdbId: tvShowResponse.id.toString(),
        imdbId: externalIdsResponse.imdb_id,
        genres: tvShowResponse.genres.map((genre) => genre.name),
        numberOfSeasons: tvShowResponse.number_of_seasons,
        numberOfEpisodes: tvShowResponse.number_of_episodes,
        originalLanguage: tvShowResponse.original_language,
        status: tvShowResponse.status,
      };
    } catch (error) {
      console.error("Error fetching TV show details from TMDB:", error);
      throw error;
    }
  }
}
