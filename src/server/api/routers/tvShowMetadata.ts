import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAllTvShowMetadataServices } from "~/lib/tv-show-metadata/getAllTvShowMetadataServices";
import { getTvShowMetadataService } from "~/lib/tv-show-metadata/getTvShowMetadataService";
import { downloadTmdbPoster } from "~/lib/image-utils";
import type { TvShowSearchResult } from "~/lib/tv-show-metadata/types";

export const tvShowMetadataRouter = createTRPCRouter({
  searchAllServices: publicProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const services = getAllTvShowMetadataServices();
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
              `Error searching TV shows with service ${service.serviceId}:`,
              error,
            );
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: [] as TvShowSearchResult[],
              error:
                error instanceof Error
                  ? error.message
                  : ("Unknown error" as string | null),
            };
          }
        }),
      );

      console.log("All TV show search results:", results);
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
        const service = getTvShowMetadataService(input.serviceId);
        if (!service) {
          throw new Error(
            `TV show metadata service ${input.serviceId} not found`,
          );
        }
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
          `Error searching TV shows with service ${input.serviceId}:`,
          error,
        );
        return {
          serviceId: input.serviceId,
          serviceName: "Unknown",
          results: [] as TvShowSearchResult[],
          error:
            error instanceof Error
              ? error.message
              : ("Unknown error" as string | null),
        };
      }
    }),

  getTvShowDetail: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
        tmdbId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const service = getTvShowMetadataService(input.serviceId);
        if (!service) {
          throw new Error(
            `TV show metadata service ${input.serviceId} not found`,
          );
        }
        const tvShowDetail = await service.getTvShowDetail(input.tmdbId);

        console.log(
          `Service ${service.serviceId} found details for TV show: ${tvShowDetail.name}`,
        );

        return {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          tvShowDetail,
          error: null as string | null,
        };
      } catch (error) {
        console.error(
          `Error fetching TV show details with service ${input.serviceId}:`,
          error,
        );
        return {
          serviceId: input.serviceId,
          serviceName: "Unknown",
          tvShowDetail: null,
          error:
            error instanceof Error
              ? error.message
              : ("Unknown error" as string | null),
        };
      }
    }),

  getAllServices: publicProcedure.query(() => {
    const services = getAllTvShowMetadataServices();
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
