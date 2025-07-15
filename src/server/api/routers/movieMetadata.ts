import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAllMovieMetadataServices } from "~/lib/movie-metadata/getAllMovieMetadataServices";
import { getMovieMetadataService } from "~/lib/movie-metadata/getMovieMetadataService";
import { downloadTmdbPoster } from "~/lib/image-utils";
import type { MovieSearchResult } from "~/lib/movie-metadata/types";

export const movieMetadataRouter = createTRPCRouter({
  searchAllServices: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const services = getAllMovieMetadataServices();
      const results = await Promise.all(
        services.map(async (service) => {
          try {
            const searchResults = await service.searchByTitle(input.title);

            console.log(
              `Service ${service.serviceId} found ${searchResults.length} results`,
            );

            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: searchResults,
              error: null as string | null,
            };
          } catch (error) {
            console.error(
              `Error searching movies with service ${service.serviceId}:`,
              error,
            );
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: [] as MovieSearchResult[],
              error:
                error instanceof Error
                  ? error.message
                  : ("Unknown error" as string | null),
            };
          }
        }),
      );

      console.log("All movie search results:", results);
      return results;
    }),

  searchByService: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        title: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const service = getMovieMetadataService(input.serviceId);
        const results = await service.searchByTitle(input.title);

        console.log(
          `Service ${service.serviceId} found ${results.length} results for title: ${input.title}`,
        );

        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          results,
          error: null as string | null,
        };
      } catch (error) {
        console.error(
          `Error searching movies with service ${input.serviceId}:`,
          error,
        );
        return {
          serviceId: input.serviceId,
          serviceName: "Unknown",
          results: [] as MovieSearchResult[],
          error:
            error instanceof Error
              ? error.message
              : ("Unknown error" as string | null),
        };
      }
    }),

  getMovieDetail: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        tmdbId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const service = getMovieMetadataService(input.serviceId);
        const movieDetail = await service.getMovieDetail(input.tmdbId);

        console.log(
          `Service ${service.serviceId} found details for movie: ${movieDetail.title}`,
        );

        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          movieDetail,
          error: null as string | null,
        };
      } catch (error) {
        console.error(
          `Error fetching movie details with service ${input.serviceId}:`,
          error,
        );
        return {
          serviceId: input.serviceId,
          serviceName: "Unknown",
          movieDetail: null,
          error:
            error instanceof Error
              ? error.message
              : ("Unknown error" as string | null),
        };
      }
    }),

  getAllServices: publicProcedure.query(() => {
    const services = getAllMovieMetadataServices();
    return services.map((service) => ({
      id: service.serviceId,
      name: service.serviceName,
    }));
  }),

  downloadTmdbPoster: publicProcedure
    .input(
      z.object({
        posterPath: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const posterUrl = await downloadTmdbPoster(input.posterPath);

        if (!posterUrl) {
          throw new Error("Failed to download and upload poster image");
        }

        return {
          success: true,
          posterUrl,
          error: null,
        };
      } catch (error) {
        console.error("Error downloading TMDB poster:", error);
        return {
          success: false,
          posterUrl: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
