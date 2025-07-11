import { Suspense } from "react";
import { type Metadata } from "next";
import { Spinner } from "~/components/ui/spinner";
import { PageHeader } from "~/components/ui/page-header";
import { StatsPage } from "~/components/statistics/StatsPage";

export const metadata: Metadata = {
  title: "Statistics | BookWorm",
  description: "Book collection statistics and reading progress",
};

export default function StatisticsPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader
        title="Library Statistics"
        description="View insights about your reading habits and collection"
      />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center p-12">
            <Spinner />
            <p className="text-muted-foreground mt-4">
              Loading summary statistics...
            </p>
          </div>
        }
      >
        <StatsPage />
      </Suspense>
    </div>
  );
}
