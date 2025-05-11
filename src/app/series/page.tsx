import React from "react";
import { SeriesTable } from "~/app/series/_components/SeriesTable";
import { SeriesDialog } from "~/app/series/_components/SeriesDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function SeriesPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div>
          <CardTitle>Series</CardTitle>
          <CardDescription>Manage your book series</CardDescription>
        </div>

        <div className="ml-auto">
          <SeriesDialog />
        </div>
      </CardHeader>

      <CardContent>
        <div className="mt-4">
          <SeriesTable />
        </div>
      </CardContent>
    </Card>
  );
}
