import { api } from "~/trpc/server";
import { PageStatisticsClient } from "./client/PageStatisticsClient";

export async function PageStatistics() {
  // Server-side data fetching
  const data = await api.statistics.getPageCountStats();

  if (!data) {
    return (
      <div className="flex h-[100px] w-full items-center justify-center">
        <p className="text-muted-foreground">No page statistics available</p>
      </div>
    );
  }

  const { totalPages, readPages, booksWithPages, booksWithoutPages } = data;
  const readPercentage =
    totalPages > 0 ? Math.round((readPages / totalPages) * 100) : 0;

  // Pass the prepared data to the client component
  return (
    <PageStatisticsClient
      data={{
        totalPages,
        readPages,
        booksWithPages,
        booksWithoutPages,
        readPercentage,
      }}
    />
  );
}
