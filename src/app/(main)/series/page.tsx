import React from "react";
import { SeriesTable } from "~/components/series/SeriesTable";
import { SeriesDialog } from "~/components/series/SeriesDialog";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";

export default function SeriesPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Series" description="Manage your book series">
        <SeriesDialog />
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <SeriesTable />
        </CardContent>
      </Card>
    </div>
  );
}
