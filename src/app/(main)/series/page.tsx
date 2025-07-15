import React, { Suspense } from "react";
import { SeriesTable } from "~/components/series/SeriesTable";
import { SeriesDialog } from "~/components/series/SeriesDialog";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

function SeriesTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full max-w-[250px]" />
      </div>
      <div className="rounded-md border">
        <div className="p-4">
          {Array(5)
            .fill(0)
            .map((_, idx) => (
              <div
                key={`skeleton-row-${idx}`}
                className="flex items-center justify-between py-3"
              >
                <Skeleton className="h-5 w-full max-w-[200px]" />
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function SeriesPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Series" description="Manage your book series">
        <SeriesDialog />
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<SeriesTableSkeleton />}>
            <SeriesTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
