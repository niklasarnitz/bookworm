import { Suspense } from "react";
import { CategoryDistributionChart } from "~/components/statistics/CategoryDistributionChart";
import { PageStatistics } from "~/components/statistics/PageStatistics";
import { ReadingProgressChart } from "~/components/statistics/ReadingProgressChart";
import { SummaryStats } from "~/components/statistics/SummaryStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";

export function StatsPage() {
  return (
    <>
      <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Suspense
          fallback={
            <div className="col-span-4 flex flex-col items-center justify-center p-8">
              <Spinner size="medium" />
              <p className="text-muted-foreground mt-2">
                Loading summary statistics...
              </p>
            </div>
          }
        >
          <SummaryStats />
        </Suspense>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reading Progress</CardTitle>
            <CardDescription>Books read over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <Suspense
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <Spinner size="medium" />
                  <p className="text-muted-foreground mt-2">
                    Loading chart data...
                  </p>
                </div>
              }
            >
              <ReadingProgressChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Books by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <Suspense
              fallback={
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <Spinner size="medium" />
                  <p className="text-muted-foreground mt-2">
                    Loading chart data...
                  </p>
                </div>
              }
            >
              <CategoryDistributionChart />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Page Statistics</CardTitle>
            <CardDescription>Reading volume statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex h-[100px] w-full flex-col items-center justify-center">
                  <Spinner size="small" />
                  <p className="text-muted-foreground mt-2">
                    Loading page statistics...
                  </p>
                </div>
              }
            >
              <PageStatistics />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
