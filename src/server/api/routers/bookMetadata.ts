import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type BookSearchResult } from "~/lib/book-metadata/types";
import { getAllBookMetadataServices } from "~/lib/book-metadata/getAllBookMetadataServices";
import { getBookMetadataService } from "~/lib/book-metadata/getBookMetadataService";

export type ServiceSearchResults = {
  serviceId: string;
  serviceName: string;
  results: BookSearchResult[];
  error?: string;
};

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
        services.map(async (service): Promise<ServiceSearchResults> => {
          try {
            const searchResults = await service.searchByIdentifier(
              input.identifier,
            );
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: searchResults,
            };
          } catch (error) {
            console.error(
              `Error searching books with service ${service.serviceId}:`,
              error,
            );
            return {
              serviceId: service.serviceId,
              serviceName: service.serviceName,
              results: [],
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }),
      );

      return results;
    }),

  searchByIdentifier: publicProcedure
    .input(
      z.object({
        serviceId: z.string(),
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
        serviceId: z.string(),
        detailUrl: z.string().url(),
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
