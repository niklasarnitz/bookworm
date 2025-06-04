import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAllBookMetadataServices } from "~/lib/book-metadata/getAllBookMetadataServices";
import { getBookMetadataService } from "~/lib/book-metadata/getBookMetadataService";
import type { BookSearchResult } from "~/lib/book-metadata/types";

export const bookMetadataRouter = createTRPCRouter({
  searchAllServices: publicProcedure
    .input(
      z.object({
        identifier: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const services = getAllBookMetadataServices();
      const results = await Promise.all(
        services.map(async (service) => {
          try {
            const searchResults = await service.searchByIdentifier(
              input.identifier,
            );

            // Validate and log each result to ensure data is properly structured
            console.log(
              `Service ${service.serviceId} found ${searchResults.length} results`,
            );

            // Ensure we're returning a properly structured object
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: searchResults,
              error: null as string | null,
            };
          } catch (error) {
            console.error(
              `Error searching books with service ${service.serviceId}:`,
              error,
            );
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: [] as BookSearchResult[],
              error:
                error instanceof Error
                  ? error.message
                  : ("Unknown error" as string | null),
            };
          }
        }),
      );

      // Log and validate the final results before returning
      const totalResults = results.reduce(
        (sum, service) => sum + service.results.length,
        0,
      );
      console.log(`Total results found across all services: ${totalResults}`);

      if (totalResults > 0) {
        // Log which services have results
        for (const service of results) {
          if (service.results.length > 0) {
            console.log(
              `Service ${service.serviceId} has ${service.results.length} results`,
            );
          }
        }
      } else {
        console.log("No results found in any service");
      }

      return results;
    }),

  searchByIdentifier: publicProcedure
    .input(
      z.object({
        serviceId: z.enum(["amazon"]),
        identifier: z.string(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const service = getBookMetadataService(input.serviceId);
        const results = await service.searchByIdentifier(input.identifier);
        return results;
      } catch (error) {
        console.error(
          `Error searching books with service ${input.serviceId}:`,
          error,
        );
        throw new Error(
          `Failed to search books. ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),

  getBookDetail: publicProcedure
    .input(
      z.object({
        serviceId: z.enum(["amazon"]),
        detailUrl: z.string(), // Remove strict URL validation to allow Amazon's special URLs
      }),
    )
    .query(async ({ input }) => {
      try {
        const service = getBookMetadataService(input.serviceId);
        const bookDetail = await service.getBookDetail(input.detailUrl);
        return bookDetail;
      } catch (error) {
        console.error(
          `Error fetching book details with service ${input.serviceId}:`,
          error,
        );
        throw new Error(
          `Failed to fetch book details. ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }),
});
