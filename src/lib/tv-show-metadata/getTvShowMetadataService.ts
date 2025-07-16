import type { TvShowMetadataService } from "./types";
import { tvShowMetadataServices } from "./services";

export function getTvShowMetadataService(
  serviceId: string,
): TvShowMetadataService | undefined {
  return tvShowMetadataServices.find(
    (service) => service.serviceId === serviceId,
  );
}
