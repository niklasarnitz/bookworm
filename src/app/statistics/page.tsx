import { Suspense } from "react";
import { type Metadata } from "next";
import { StatsPage } from "./_components/StatsPage";
import { Spinner } from "~/components/ui/spinner";

export const metadata: Metadata = {
  title: "Statistics | BookWorm",
  description: "Book collection statistics and reading progress",
};

export default function StatisticsPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Library Statistics</h1>
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
    </>
  );
}
