import React from "react";
import { AuthorTable } from "~/components/authors/AuthorTable";
import { AuthorDialog } from "~/components/authors/AuthorDialog";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent } from "~/components/ui/card";

export default function AuthorsPage() {
  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Authors" description="Manage your book authors">
        <AuthorDialog />
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <AuthorTable />
        </CardContent>
      </Card>
    </div>
  );
}
