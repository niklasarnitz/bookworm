import React from "react";
import { SeriesTable } from "~/app/series/_components/SeriesTable";
import { SeriesDialog } from "~/app/series/_components/SeriesDialog";
import { PageHeader } from "~/components/ui/page-header";
import {
  Card,
  CardContent,
} from "~/components/ui/card";

export default function SeriesPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        title="Series" 
        description="Manage your book series"
      >
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
