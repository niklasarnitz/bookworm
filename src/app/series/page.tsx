import React from "react";
import { SeriesManager } from "~/app/series/_components/SeriesManager";
import { SeriesTable } from "~/app/series/_components/SeriesTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function SeriesPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Series</CardTitle>
            <CardDescription>Manage your book series</CardDescription>
          </div>

          <div className="ml-auto">
            <SeriesManager />
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-4">
            <SeriesTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
