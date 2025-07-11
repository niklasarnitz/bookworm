import { format, parseISO } from "date-fns";
import { api } from "~/trpc/server";
import { ReadingProgressChartClient } from "./client/ReadingProgressChartClient";

export async function ReadingProgressChart() {
  // Server-side data fetching
  const chartData = await api.statistics.getReadingProgress();

  // If no data, return message
  if (!chartData.length) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-muted-foreground">No reading data available</p>
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...chartData].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Format dates for display
  const formattedData = sortedData.map((item) => ({
    date: format(parseISO(`${item.date}-01`), "MMM yyyy"),
    books: item.count,
  }));

  // Pass the prepared data to the client component
  return <ReadingProgressChartClient data={formattedData} />;
}
